import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AdminConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async getAllConfig() {
    const configs = await this.prisma.systemConfig.findMany();
    const result: Record<string, any> = {};
    for (const c of configs) {
      try {
        result[c.key] = JSON.parse(c.value);
      } catch {
        result[c.key] = c.value;
      }
    }
    result['AI_MODE_ACTIVE'] = this.aiService.getMode();
    return result;
  }

  async updateConfig(key: string, value: any, description?: string) {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    if (key === 'AI_MODE' && (value === 'mock' || value === 'openai' || value?.mode)) {
      const mode = typeof value === 'string' ? value : value.mode;
      this.aiService.setMode(mode);
    }

    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value: valueStr, description },
      create: { key, value: valueStr, description },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { reports: true, workOrders: true, verifications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async getAllLocations() {
    return this.prisma.location.findMany({
      include: {
        _count: { select: { issues: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAllCategories() {
    return this.prisma.issueCategory.findMany({
      orderBy: { defaultSeverity: 'desc' },
    });
  }
}
