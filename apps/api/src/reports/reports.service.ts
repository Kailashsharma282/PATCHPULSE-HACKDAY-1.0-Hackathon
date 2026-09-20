import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ClusteringService } from '../clustering/clustering.service';
import { PriorityService } from '../priority/priority.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly clusteringService: ClusteringService,
    private readonly priorityService: PriorityService,
  ) {}

  async createReport(userId: string | undefined, dto: CreateReportDto) {
    this.logger.log(`Processing new report from user: ${userId || 'ANONYMOUS'}`);

    // 1. AI Classification & Feature Extraction
    const classification = await this.aiService.classifyText(dto.description);
    const category = dto.category || classification.category;

    // 2. Generate Semantic Embedding
    const embeddingVector = await this.aiService.generateEmbedding(dto.description);
    const embeddingStr = JSON.stringify(embeddingVector);

    // 3. Create Report in DB
    const report = await this.prisma.report.create({
      data: {
        userId,
        description: dto.description.trim(),
        mediaUrl: dto.mediaUrl,
        voiceUrl: dto.voiceUrl,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: 'PENDING',
        aiCategory: category,
        aiConfidence: classification.confidence,
        embedding: embeddingStr,
      },
    });

    // 4. Create Weak Signals (Section 10)
    const signalsToCreate = [
      {
        reportId: report.id,
        type: 'TEXT',
        source: 'CITIZEN_SUBMISSION',
        content: dto.description.trim(),
        confidence: classification.confidence,
        timestamp: new Date(),
      },
    ];

    if (dto.mediaUrl) {
      const visionResult = await this.aiService.analyzeImage(dto.mediaUrl, dto.description);
      signalsToCreate.push({
        reportId: report.id,
        type: 'PHOTO',
        source: 'CITIZEN_PHOTO_UPLOAD',
        content: `${visionResult.visualSummary} | Features: ${visionResult.detectedFeatures.join(', ')}`,
        confidence: visionResult.confidence,
        timestamp: new Date(),
      });
    }

    if (dto.voiceUrl) {
      const transcription = await this.aiService.transcribeVoice(dto.voiceUrl);
      signalsToCreate.push({
        reportId: report.id,
        type: 'VOICE',
        source: 'VOICE_GATEWAY',
        content: `Transcription: "${transcription}"`,
        confidence: 0.92,
        timestamp: new Date(),
      });
    }

    if (dto.latitude && dto.longitude) {
      signalsToCreate.push({
        reportId: report.id,
        type: 'LOCATION',
        source: 'DEVICE_GPS',
        content: `Coordinates: ${dto.latitude.toFixed(5)}, ${dto.longitude.toFixed(5)} (${dto.locationName || 'Campus Grid'})`,
        confidence: 0.98,
        timestamp: new Date(),
      });
    }

    const createdSignals: any[] = [];
    for (const sig of signalsToCreate) {
      const s = await this.prisma.signal.create({ data: sig });
      createdSignals.push(s);
    }

    // 5. Run Multi-Dimensional Clustering Engine (Section 13)
    const clusterMatch = await this.clusteringService.findBestClusterMatch(
      dto.description,
      category,
      dto.latitude,
      dto.longitude,
      embeddingVector,
      report.createdAt
    );

    let activeIssue: any;
    let isClustered = false;

    if (clusterMatch && clusterMatch.isMatch) {
      // --- Corroborate Existing Issue ---
      isClustered = true;
      this.logger.log(`Report matched existing issue #${clusterMatch.issueId} (Score: ${clusterMatch.clusterScore})`);

      const existingIssue = await this.prisma.issue.findUnique({
        where: { id: clusterMatch.issueId },
        include: { reports: true, signals: true },
      });

      if (!existingIssue) {
        throw new NotFoundException(`Matched issue ${clusterMatch.issueId} not found`);
      }

      // Link report to issue
      await this.prisma.report.update({
        where: { id: report.id },
        data: {
          issueId: existingIssue.id,
          status: 'CLUSTERED',
        },
      });

      await this.prisma.issueReport.create({
        data: {
          issueId: existingIssue.id,
          reportId: report.id,
          weight: clusterMatch.clusterScore,
        },
      });

      for (const sig of createdSignals) {
        await this.prisma.signal.update({
          where: { id: sig.id },
          data: { issueId: existingIssue.id },
        });
        await this.prisma.issueSignal.create({
          data: {
            issueId: existingIssue.id,
            signalId: sig.id,
            relevance: clusterMatch.clusterScore,
          },
        });
      }

      // Recalculate Explainable Priority with Corroboration Escalation
      const newSignalCount = existingIssue.signalCount + createdSignals.length;
      const newReportCount = existingIssue.reportCount + 1;
      const daysPersistent =
        (Date.now() - new Date(existingIssue.firstDetectedAt).getTime()) / (1000 * 60 * 60 * 24);

      const updatedPriority = this.priorityService.calculatePriority({
        severity: Math.max(existingIssue.severity, classification.severity),
        confidence: Math.min(0.99, existingIssue.confidence + 0.05),
        affectedRadius: existingIssue.affectedRadius,
        persistenceDays: daysPersistent,
        signalCount: newSignalCount,
        reportCount: newReportCount,
        category: existingIssue.canonicalCategory,
        locationName: existingIssue.locationName,
      });

      // Next lifecycle status
      let nextStatus = existingIssue.status;
      if (existingIssue.status === 'DETECTED') {
        nextStatus = 'CORROBORATING';
      } else if (existingIssue.status === 'CORROBORATING' && updatedPriority.score >= 70) {
        nextStatus = 'PRIORITIZED';
      }

      activeIssue = await this.prisma.issue.update({
        where: { id: existingIssue.id },
        data: {
          status: nextStatus,
          signalCount: newSignalCount,
          reportCount: newReportCount,
          lastDetectedAt: new Date(),
          confidence: Math.min(0.99, existingIssue.confidence + 0.05),
          priorityScore: updatedPriority.score,
          priorityBand: updatedPriority.band,
          priorityReasoning: JSON.stringify(updatedPriority),
        },
      });
    } else {
      // --- Create New Issue Fingerprint ---
      const nextId = `P-${Math.floor(100 + Math.random() * 900)}`;
      this.logger.log(`No cluster match found. Creating new Issue Fingerprint #${nextId}`);

      const initialPriority = this.priorityService.calculatePriority({
        severity: classification.severity,
        confidence: classification.confidence,
        affectedRadius: classification.affectedRadiusMeters,
        persistenceDays: 0,
        signalCount: createdSignals.length,
        reportCount: 1,
        category,
        locationName: dto.locationName || 'Campus Sector',
      });

      activeIssue = await this.prisma.issue.create({
        data: {
          id: nextId,
          canonicalCategory: category,
          canonicalSummary: classification.summary,
          locationName: dto.locationName || 'Campus Main Grid',
          latitude: dto.latitude || 12.9915,
          longitude: dto.longitude || 80.2337,
          status: initialPriority.score >= 75 ? 'PRIORITIZED' : 'DETECTED',
          confidence: classification.confidence,
          severity: classification.severity,
          priorityScore: initialPriority.score,
          priorityBand: initialPriority.band,
          priorityReasoning: JSON.stringify(initialPriority),
          affectedRadius: classification.affectedRadiusMeters,
          signalCount: createdSignals.length,
          reportCount: 1,
          firstDetectedAt: new Date(),
          lastDetectedAt: new Date(),
        },
      });

      // Link report & signals
      await this.prisma.report.update({
        where: { id: report.id },
        data: { issueId: activeIssue.id, status: 'CLUSTERED' },
      });

      await this.prisma.issueReport.create({
        data: { issueId: activeIssue.id, reportId: report.id, weight: 1.0 },
      });

      for (const sig of createdSignals) {
        await this.prisma.signal.update({
          where: { id: sig.id },
          data: { issueId: activeIssue.id },
        });
        await this.prisma.issueSignal.create({
          data: { issueId: activeIssue.id, signalId: sig.id, relevance: 1.0 },
        });
      }
    }

    // 6. Create in-app notification if user is authenticated
    if (userId) {
      await this.prisma.notification.create({
        data: {
          userId,
          title: isClustered ? 'Report Corroborated with Active Issue' : 'New Incident Fingerprint Created',
          message: `Your report has been analyzed by AI and assigned to Issue #${activeIssue.id} (${activeIssue.canonicalSummary}).`,
          type: 'INFO',
          link: `/issues/${activeIssue.id}`,
        },
      });
    }

    return {
      report,
      issue: activeIssue,
      isClustered,
      clusterDetails: clusterMatch,
      signals: createdSignals,
    };
  }

  async findAll(query: { page?: number; limit?: number; status?: string; userId?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
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
              status: true,
              priorityScore: true,
              priorityBand: true,
            },
          },
          user: {
            select: { id: true, name: true, role: true, avatar: true },
          },
          signals: true,
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      items: reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        issue: true,
        user: { select: { id: true, name: true, role: true } },
        signals: true,
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }
}
