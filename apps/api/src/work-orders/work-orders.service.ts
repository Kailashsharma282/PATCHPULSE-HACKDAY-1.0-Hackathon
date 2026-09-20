import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const WO_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['ASSIGNED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'CLOSED'],
  IN_PROGRESS: ['COMPLETED', 'VERIFICATION_PENDING', 'ASSIGNED', 'CLOSED'],
  COMPLETED: ['VERIFIED', 'REOPENED', 'VERIFICATION_PENDING'],
  VERIFICATION_PENDING: ['VERIFIED', 'REOPENED'],
  VERIFIED: ['REOPENED', 'CLOSED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS', 'CLOSED'],
  CLOSED: ['REOPENED'],
};

export interface CreateWorkOrderDto {
  issueId: string;
  summary?: string;
  priority?: string;
  recommendedAction?: string;
  requiredTeam?: string;
  suggestedEquipment?: string;
  deadline?: string;
  assignedToUserId?: string;
  notes?: string;
}

@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createWorkOrder(dto: CreateWorkOrderDto, actorId?: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: dto.issueId },
    });

    if (!issue) {
      throw new NotFoundException(`Issue #${dto.issueId} not found`);
    }

    // Default recommendations based on category
    let defaultAction = dto.recommendedAction || 'Inspect site and perform required structural maintenance.';
    let defaultTeam = dto.requiredTeam || 'Campus Facilities Response Team';
    let defaultEquipment = dto.suggestedEquipment || 'Standard maintenance toolkit and safety barriers';

    if (issue.canonicalCategory === 'STREETLIGHT') {
      defaultAction = 'Inspect wiring and junction box at pole base, replace defective 150W LED fixture.';
      defaultTeam = 'Electrical Maintenance Unit 2';
      defaultEquipment = 'Hydraulic boom lift truck, 150W IP66 LED Luminaire, Multimeter';
    } else if (issue.canonicalCategory === 'POTHOLE') {
      defaultAction = 'Excavate compromised asphalt perimeter, apply tack emulsion, compact cold-mix asphalt.';
      defaultTeam = 'Civil Road Maintenance Squad';
      defaultEquipment = 'Asphalt compactor roller, bituminous emulsion sprayer, safety cones';
    } else if (issue.canonicalCategory === 'WATER_LEAKAGE') {
      defaultAction = 'Isolate supply valve, excavate leak zone, install stainless steel pipe clamp.';
      defaultTeam = 'Civil Hydraulics Rapid Response';
      defaultEquipment = 'Submersible drainage pump, 90mm pipe repair clamp, backhoe excavator';
    }

    const nextId = `PX-0${Math.floor(100 + Math.random() * 900)}`;

    const workOrder = await this.prisma.workOrder.create({
      data: {
        id: nextId,
        issueId: issue.id,
        summary: dto.summary || `Work Order: ${issue.canonicalSummary}`,
        priority: dto.priority || issue.priorityBand,
        recommendedAction: defaultAction,
        requiredTeam: defaultTeam,
        suggestedEquipment: defaultEquipment,
        deadline: dto.deadline ? new Date(dto.deadline) : new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: dto.assignedToUserId ? 'ASSIGNED' : 'OPEN',
        assignedToUserId: dto.assignedToUserId,
        notes: dto.notes,
      },
      include: {
        issue: true,
        assignedToUser: { select: { id: true, name: true, role: true } },
      },
    });

    // Update Issue status to ASSIGNED
    await this.prisma.issue.update({
      where: { id: issue.id },
      data: { status: 'ASSIGNED' },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'CREATE_WORK_ORDER',
        entity: 'WorkOrder',
        entityId: workOrder.id,
        metadata: JSON.stringify({ issueId: issue.id, priority: workOrder.priority }),
      },
    });

    return workOrder;
  }

  async findAll(query: { page?: number; limit?: number; status?: string; priority?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'ALL') where.status = query.status;
    if (query.priority && query.priority !== 'ALL') where.priority = query.priority;

    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          issue: {
            select: {
              id: true,
              canonicalSummary: true,
              canonicalCategory: true,
              priorityScore: true,
              priorityBand: true,
              locationName: true,
            },
          },
          assignedToUser: { select: { id: true, name: true, role: true, avatar: true } },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        issue: {
          include: {
            reports: true,
            signals: true,
            verifications: true,
          },
        },
        assignedToUser: { select: { id: true, name: true, role: true, avatar: true } },
        verifications: true,
      },
    });

    if (!wo) {
      throw new NotFoundException(`Work Order #${id} not found`);
    }

    return wo;
  }

  async updateStatus(id: string, newStatus: string, actorId?: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!wo) {
      throw new NotFoundException(`Work Order #${id} not found`);
    }

    const allowed = WO_TRANSITIONS[wo.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid work order transition: Cannot transition from ${wo.status} to ${newStatus}. Allowed: [${allowed.join(', ')}]`
      );
    }

    const data: any = { status: newStatus };
    if (newStatus === 'COMPLETED' || newStatus === 'VERIFIED') {
      data.completedAt = new Date();
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data,
      include: { issue: true },
    });

    // Update issue status corresponding to work order progress
    if (newStatus === 'IN_PROGRESS') {
      await this.prisma.issue.update({
        where: { id: wo.issueId },
        data: { status: 'IN_PROGRESS' },
      });
    } else if (newStatus === 'COMPLETED') {
      await this.prisma.issue.update({
        where: { id: wo.issueId },
        data: { status: 'RESOLVED_PENDING_VERIFICATION' },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'UPDATE_WORK_ORDER_STATUS',
        entity: 'WorkOrder',
        entityId: id,
        metadata: JSON.stringify({ from: wo.status, to: newStatus }),
      },
    });

    return updated;
  }

  async assign(id: string, assignedToUserId: string, actorId?: string) {
    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        assignedToUserId,
        status: 'ASSIGNED',
      },
      include: {
        assignedToUser: true,
        issue: true,
      },
    });

    return updated;
  }
}
