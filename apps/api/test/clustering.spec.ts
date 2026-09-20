import { ClusteringService } from '../src/clustering/clustering.service';
import { AiService } from '../src/ai/ai.service';

describe('ClusteringService Unit Tests', () => {
  let clusteringService: ClusteringService;
  let aiService: AiService;
  let mockPrisma: any;

  beforeEach(() => {
    aiService = new AiService();
    mockPrisma = {
      issue: {
        findMany: jest.fn(),
      },
    };
    clusteringService = new ClusteringService(mockPrisma as any, aiService);
  });

  describe('Haversine Proximity Calculation', () => {
    it('should calculate 0 distance for identical coordinates', () => {
      const dist = clusteringService.calculateHaversineDistance(12.9915, 80.2337, 12.9915, 80.2337);
      expect(dist).toBeCloseTo(0, 1);
    });

    it('should accurately calculate distance between Block C and Hostel Gate (~270m)', () => {
      const dist = clusteringService.calculateHaversineDistance(12.9915, 80.2337, 12.9928, 80.2312);
      expect(dist).toBeGreaterThan(200);
      expect(dist).toBeLessThan(350);
    });

    it('should return location similarity 1.0 for identical coordinates', () => {
      const { similarity, distanceMeters } = clusteringService.calculateLocationSimilarity(
        12.9915, 80.2337, 12.9915, 80.2337
      );
      expect(similarity).toBe(1.0);
      expect(distanceMeters).toBe(0);
    });

    it('should return location similarity 0 for coordinates exceeding max radius (e.g. 5km away)', () => {
      const { similarity, distanceMeters } = clusteringService.calculateLocationSimilarity(
        12.9915, 80.2337, 13.0500, 80.2800
      );
      expect(similarity).toBe(0);
      expect(distanceMeters).toBeGreaterThan(150);
    });

    it('should handle null/missing coordinates gracefully without crashing', () => {
      const { similarity, distanceMeters } = clusteringService.calculateLocationSimilarity(
        null, null, 12.9915, 80.2337
      );
      expect(similarity).toBe(0.5);
      expect(distanceMeters).toBe(0);
    });
  });

  describe('Temporal Similarity with Decay', () => {
    it('should return 1.0 for simultaneous reports', () => {
      const now = new Date();
      const sim = clusteringService.calculateTemporalSimilarity(now, now);
      expect(sim).toBeCloseTo(1.0, 2);
    });

    it('should decay smoothly over several days while remaining positive for persistent issues', () => {
      const time1 = new Date();
      const time2 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const sim = clusteringService.calculateTemporalSimilarity(time1, time2);
      expect(sim).toBeGreaterThan(0.2);
      expect(sim).toBeLessThan(0.6);
    });
  });

  describe('Category Similarity', () => {
    it('should return 1.0 for matching categories', () => {
      expect(clusteringService.calculateCategorySimilarity('STREETLIGHT', 'STREETLIGHT')).toBe(1.0);
    });

    it('should return 0.7 for compatible categories (e.g. STREETLIGHT and UNSAFE_PATHWAY)', () => {
      expect(clusteringService.calculateCategorySimilarity('STREETLIGHT', 'UNSAFE_PATHWAY')).toBe(0.7);
    });

    it('should return low score for divergent categories (e.g. STREETLIGHT and GARBAGE_OVERFLOW)', () => {
      expect(clusteringService.calculateCategorySimilarity('STREETLIGHT', 'GARBAGE_OVERFLOW')).toBe(0.1);
    });
  });
});
