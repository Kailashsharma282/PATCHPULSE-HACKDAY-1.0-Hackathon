import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriorityService } from '../priority/priority.service';
import { AiService } from '../ai/ai.service';
import { IssueStatus } from '@patchpulse/shared';

// Controlled State Machine Rules (Section 110)
const VALID_TRANSITIONS: Record<string, string[]> = {
  DETECTED: ['CORROBORATING', 'PRIORITIZED', 'ASSIGNED', 'CLOSED'],
  CORROBORATING: ['PRIORITIZED', 'ASSIGNED', 'CLOSED'],
  PRIORITIZED: ['ASSIGNED', 'IN_PROGRESS', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'PRIORITIZED', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED_PENDING_VERIFICATION', 'ASSIGNED', 'CLOSED'],
  RESOLVED_PENDING_VERIFICATION: ['VERIFIED_RESOLVED', 'REOPENED', 'IN_PROGRESS'],
  VERIFIED_RESOLVED: ['REOPENED', 'CLOSED'],
  REOPENED: ['IN_PROGRESS', 'ASSIGNED', 'PRIORITIZED'],
  CLOSED: ['REOPENED'],
};

@Injectable()
export class IssuesService {
  private readonly logger = new Logger(IssuesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly priorityService: PriorityService,
    private readonly aiService: AiService,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    priorityBand?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.category && query.category !== 'ALL') {
      where.canonicalCategory = query.category;
    }
    if (query.priorityBand && query.priorityBand !== 'ALL') {
      where.priorityBand = query.priorityBand;
    }
    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { id: { contains: search } },
        { canonicalSummary: { contains: search } },
        { locationName: { contains: search } },
        { canonicalCategory: { contains: search } },
      ];
    }

    // Sort order
    let orderBy: any = { priorityScore: 'desc' };
    if (query.sortBy === 'newest') orderBy = { createdAt: 'desc' };
    else if (query.sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (query.sortBy === 'confidence') orderBy = { confidence: 'desc' };
    else if (query.sortBy === 'persistence') orderBy = { firstDetectedAt: 'asc' };
    else if (query.sortBy === 'signals') orderBy = { signalCount: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          workOrders: {
            select: { id: true, status: true, summary: true, requiredTeam: true },
          },
          _count: {
            select: { reports: true, signals: true },
          },
        },
      }),
      this.prisma.issue.count({ where }),
    ]);

    // Parse priority reasoning JSON for each item
    const formattedItems = items.map((item) => {
      let parsedReasoning = null;
      try {
        if (item.priorityReasoning) {
          parsedReasoning = JSON.parse(item.priorityReasoning);
        }
      } catch (e) {}
      return {
        ...item,
        priorityReasoning: parsedReasoning,
      };
    });

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        reports: {
          include: {
            user: { select: { id: true, name: true, role: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        signals: {
          orderBy: { timestamp: 'asc' },
        },
        workOrders: {
          include: {
            assignedToUser: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        verifications: {
          include: {
            verifiedByUser: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID #${id} not found`);
    }

    let parsedReasoning = null;
    try {
      if (issue.priorityReasoning) {
        parsedReasoning = JSON.parse(issue.priorityReasoning);
      }
    } catch (e) {}

    return {
      ...issue,
      priorityReasoning: parsedReasoning,
    };
  }

  /**
   * Controlled state transition validation (Section 110)
   */
  async updateStatus(id: string, newStatus: string, actorId?: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      throw new NotFoundException(`Issue #${id} not found`);
    }

    const currentStatus = issue.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: Cannot move from [${currentStatus}] to [${newStatus}]. Allowed transitions: [${allowed.join(', ')}]`
      );
    }

    const updated = await this.prisma.issue.update({
      where: { id },
      data: {
        status: newStatus,
        lastDetectedAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'UPDATE_ISSUE_STATUS',
        entity: 'Issue',
        entityId: id,
        metadata: JSON.stringify({ from: currentStatus, to: newStatus }),
      },
    });

    return updated;
  }

  async recalculatePriority(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: { reports: true, signals: true },
    });

    if (!issue) {
      throw new NotFoundException(`Issue #${id} not found`);
    }

    const persistenceDays =
      (Date.now() - new Date(issue.firstDetectedAt).getTime()) / (1000 * 60 * 60 * 24);

    const breakdown = this.priorityService.calculatePriority({
      severity: issue.severity,
      confidence: issue.confidence,
      affectedRadius: issue.affectedRadius,
      persistenceDays,
      signalCount: issue.signals.length || issue.signalCount,
      reportCount: issue.reports.length || issue.reportCount,
      category: issue.canonicalCategory,
      locationName: issue.locationName,
    });

    const updated = await this.prisma.issue.update({
      where: { id },
      data: {
        priorityScore: breakdown.score,
        priorityBand: breakdown.band,
        priorityReasoning: JSON.stringify(breakdown),
      },
    });

    return {
      issue: updated,
      breakdown,
    };
  }
}
