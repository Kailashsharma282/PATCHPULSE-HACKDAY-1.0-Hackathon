import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

export interface VerifyResolutionDto {
  issueId: string;
  workOrderId?: string;
  afterImageUrl: string;
  beforeImageUrl?: string;
  operatorNotes?: string;
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async verifyIssueResolution(dto: VerifyResolutionDto, verifiedByUserId?: string) {
    this.logger.log(`Verifying issue resolution for #${dto.issueId}`);

    const issue = await this.prisma.issue.findUnique({
      where: { id: dto.issueId },
      include: {
        reports: { where: { mediaUrl: { not: null } } },
        workOrders: true,
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue #${dto.issueId} not found`);
    }

    // Determine Before Image
    let beforeImage = dto.beforeImageUrl;
    if (!beforeImage) {
      const reportWithMedia = issue.reports.find((r) => r.mediaUrl);
      beforeImage = reportWithMedia?.mediaUrl || 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800';
    }

    // 1. Run AI Before/After Visual Comparison
    const aiResult = await this.aiService.verifyResolution(
      beforeImage,
      dto.afterImageUrl,
      issue.canonicalCategory
    );

    const isVerified = aiResult.isResolved && aiResult.resolutionConfidence >= 0.85;
    const verificationStatus = isVerified ? 'VERIFIED_RESOLVED' : 'REOPENED_FOR_REVIEW';

    // 2. Persist Verification Record
    const verification = await this.prisma.verification.create({
      data: {
        issueId: issue.id,
        workOrderId: dto.workOrderId,
        beforeImageUrl: beforeImage,
        afterImageUrl: dto.afterImageUrl,
        visualChangeScore: aiResult.visualChangeScore,
        resolutionConfidence: aiResult.resolutionConfidence,
        detectedBeforeState: aiResult.detectedBeforeState,
        detectedAfterState: aiResult.detectedAfterState,
        recommendation: aiResult.recommendation,
        status: verificationStatus,
        verifiedByUserId,
        verifiedAt: new Date(),
      },
      include: {
        verifiedByUser: { select: { id: true, name: true, role: true } },
      },
    });

    // 3. Update Issue & Work Order Status
    if (isVerified) {
      await this.prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: 'VERIFIED_RESOLVED',
          lastDetectedAt: new Date(),
        },
      });

      if (dto.workOrderId) {
        await this.prisma.workOrder.update({
          where: { id: dto.workOrderId },
          data: {
            status: 'VERIFIED',
            completedAt: new Date(),
          },
        });
      }
    } else {
      await this.prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: 'REOPENED',
          lastDetectedAt: new Date(),
        },
      });

      if (dto.workOrderId) {
        await this.prisma.workOrder.update({
          where: { id: dto.workOrderId },
          data: { status: 'REOPENED' },
        });
      }
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: verifiedByUserId,
        action: 'VERIFY_RESOLUTION',
        entity: 'Verification',
        entityId: verification.id,
        metadata: JSON.stringify({
          issueId: issue.id,
          status: verificationStatus,
          confidence: aiResult.resolutionConfidence,
        }),
      },
    });

    return {
      verification,
      isVerified,
      confidence: aiResult.resolutionConfidence,
      recommendation: aiResult.recommendation,
    };
  }

  async reopenIssue(issueId: string, reason: string, actorId?: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new NotFoundException(`Issue #${issueId} not found`);
    }

    const updated = await this.prisma.issue.update({
      where: { id: issueId },
      data: {
        status: 'REOPENED',
        lastDetectedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'REOPEN_ISSUE',
        entity: 'Issue',
        entityId: issueId,
        metadata: JSON.stringify({ reason }),
      },
    });

    return updated;
  }
}
