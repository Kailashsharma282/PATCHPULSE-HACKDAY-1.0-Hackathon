import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateSignalDto {
  issueId?: string;
  reportId?: string;
  type: string;
  source: string;
  content: string;
  confidence?: number;
  metadata?: any;
}

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSignal(dto: CreateSignalDto) {
    this.logger.log(`Ingesting signal [${dto.type}] from source: ${dto.source}`);
    const signal = await this.prisma.signal.create({
      data: {
        issueId: dto.issueId,
        reportId: dto.reportId,
        type: dto.type,
        source: dto.source,
        content: dto.content,
        confidence: dto.confidence ?? 0.9,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      },
      include: {
        issue: {
          select: { id: true, canonicalSummary: true, priorityScore: true, priorityBand: true },
        },
      },
    });

    if (dto.issueId) {
      await this.prisma.issueSignal.create({
        data: {
          issueId: dto.issueId,
          signalId: signal.id,
          relevance: 1.0,
        },
      });

      // Update signal count on issue
      await this.prisma.issue.update({
        where: { id: dto.issueId },
        data: {
          signalCount: { increment: 1 },
          lastDetectedAt: new Date(),
        },
      });
    }

    return signal;
  }

  async getRecentSignals(limit = 30) {
    return this.prisma.signal.findMany({
      take: Math.min(100, limit),
      orderBy: { timestamp: 'desc' },
      include: {
        issue: {
          select: {
            id: true,
            canonicalSummary: true,
            canonicalCategory: true,
            priorityScore: true,
            priorityBand: true,
            status: true,
          },
        },
      },
    });
  }

  async getSignalsByIssue(issueId: string) {
    return this.prisma.signal.findMany({
      where: { issueId },
      orderBy: { timestamp: 'asc' },
    });
  }
}
