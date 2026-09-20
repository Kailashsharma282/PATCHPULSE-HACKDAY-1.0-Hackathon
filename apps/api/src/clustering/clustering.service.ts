import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

export interface ClusterEvaluation {
  issueId: string;
  clusterScore: number;
  isMatch: boolean;
  breakdown: {
    semanticSimilarity: number;
    locationSimilarity: number;
    categorySimilarity: number;
    temporalSimilarity: number;
    distanceMeters: number;
  };
}

@Injectable()
export class ClusteringService {
  private readonly logger = new Logger(ClusteringService.name);

  // Configurable weights and thresholds (Section 13)
  private weights = {
    semantic: 0.45,
    location: 0.30,
    category: 0.15,
    temporal: 0.10,
  };
  private threshold = 0.78;
  private maxRadiusMeters = 150; // Max cluster search radius

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Haversine formula to compute great-circle distance between two GPS coordinates in meters
   */
  calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Location similarity normalized between 0 and 1
   */
  calculateLocationSimilarity(lat1?: number | null, lon1?: number | null, lat2?: number | null, lon2?: number | null): { similarity: number; distanceMeters: number } {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return { similarity: 0.5, distanceMeters: 0 }; // Safe neutral fallback if coords missing
    }

    const dist = this.calculateHaversineDistance(lat1, lon1, lat2, lon2);
    if (dist > this.maxRadiusMeters) {
      return { similarity: 0, distanceMeters: dist };
    }

    const similarity = Math.max(0, 1 - dist / this.maxRadiusMeters);
    return { similarity, distanceMeters: dist };
  }

  /**
   * Temporal similarity with decay curve
   */
  calculateTemporalSimilarity(time1: Date, time2: Date): number {
    const diffHours = Math.abs(time1.getTime() - time2.getTime()) / (1000 * 60 * 60);
    // Exponential decay: Halves every 72 hours (3 days)
    return Math.exp(-diffHours / 72);
  }

  /**
   * Category similarity
   */
  calculateCategorySimilarity(cat1: string, cat2: string): number {
    if (!cat1 || !cat2) return 0.5;
    if (cat1.toUpperCase() === cat2.toUpperCase()) return 1.0;

    // Compatible related categories
    const relatedPairs = [
      ['STREETLIGHT', 'UNSAFE_PATHWAY'],
      ['POTHOLE', 'DAMAGED_SIDEWALK'],
      ['WATER_LEAKAGE', 'BLOCKED_DRAIN'],
      ['ACCESSIBILITY_ISSUE', 'DAMAGED_SIDEWALK'],
    ];

    for (const [a, b] of relatedPairs) {
      if (
        (cat1.toUpperCase() === a && cat2.toUpperCase() === b) ||
        (cat1.toUpperCase() === b && cat2.toUpperCase() === a)
      ) {
        return 0.7;
      }
    }

    return 0.1;
  }

  /**
   * Core multi-dimensional clustering algorithm
   */
  async findBestClusterMatch(
    description: string,
    category: string,
    latitude?: number | null,
    longitude?: number | null,
    reportEmbedding?: number[],
    reportDate = new Date()
  ): Promise<ClusterEvaluation | null> {
    // 1. Fetch active issues (not CLOSED or VERIFIED_RESOLVED)
    const activeIssues = await this.prisma.issue.findMany({
      where: {
        status: {
          notIn: ['CLOSED', 'VERIFIED_RESOLVED'],
        },
      },
      include: {
        reports: { select: { embedding: true, description: true } },
      },
    });

    if (activeIssues.length === 0) {
      return null;
    }

    // 2. Generate embedding for current report if not provided
    const embedding = reportEmbedding || (await this.aiService.generateEmbedding(description));

    let bestMatch: ClusterEvaluation | null = null;
    let highestScore = 0;

    for (const issue of activeIssues) {
      // Location similarity
      const { similarity: locSim, distanceMeters } = this.calculateLocationSimilarity(
        latitude,
        longitude,
        issue.latitude,
        issue.longitude
      );

      // If location is drastically far (> 1000m), skip immediately unless both coords missing
      if (distanceMeters > 1000 && latitude != null && longitude != null) {
        continue;
      }

      // Semantic similarity
      const issueEmbedding = await this.aiService.generateEmbedding(issue.canonicalSummary);
      const semSim = this.aiService.calculateCosineSimilarity(embedding, issueEmbedding);

      // Category similarity
      const catSim = this.calculateCategorySimilarity(category, issue.canonicalCategory);

      // Temporal similarity
      const timeSim = this.calculateTemporalSimilarity(reportDate, issue.lastDetectedAt);

      // Weighted Composite Score (Section 13)
      const compositeScore = Number(
        (
          this.weights.semantic * semSim +
          this.weights.location * locSim +
          this.weights.category * catSim +
          this.weights.temporal * timeSim
        ).toFixed(4)
      );

      const evaluation: ClusterEvaluation = {
        issueId: issue.id,
        clusterScore: compositeScore,
        isMatch: compositeScore >= this.threshold,
        breakdown: {
          semanticSimilarity: Number(semSim.toFixed(3)),
          locationSimilarity: Number(locSim.toFixed(3)),
          categorySimilarity: Number(catSim.toFixed(3)),
          temporalSimilarity: Number(timeSim.toFixed(3)),
          distanceMeters: Math.round(distanceMeters),
        },
      };

      if (compositeScore > highestScore) {
        highestScore = compositeScore;
        bestMatch = evaluation;
      }
    }

    return bestMatch && bestMatch.isMatch ? bestMatch : null;
  }
}
