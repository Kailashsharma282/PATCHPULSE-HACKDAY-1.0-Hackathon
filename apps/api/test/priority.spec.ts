import { PriorityService } from '../src/priority/priority.service';
import { PriorityBand } from '@patchpulse/shared';

describe('PriorityService Unit Tests', () => {
  let priorityService: PriorityService;

  beforeEach(() => {
    priorityService = new PriorityService();
  });

  it('should calculate CRITICAL score (>=75) for high severity persistent nighttime streetlight issue', () => {
    const result = priorityService.calculatePriority({
      severity: 8,
      confidence: 0.94,
      affectedRadius: 120,
      persistenceDays: 5,
      signalCount: 4,
      reportCount: 3,
      category: 'STREETLIGHT',
      locationName: 'Block C Parking Area',
      isNightTime: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.band).toBe(PriorityBand.CRITICAL);
    expect(result.factors.severity).toBe(80);
    expect(result.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('should calculate LOW score (<30) for minimal severity minor cosmetic issue', () => {
    const result = priorityService.calculatePriority({
      severity: 1,
      confidence: 0.3,
      affectedRadius: 10,
      persistenceDays: 0,
      signalCount: 1,
      reportCount: 1,
      category: 'DAMAGED_BENCH',
      locationName: 'Quiet Garden Corner',
      isNightTime: false,
    });

    expect(result.score).toBeLessThan(35);
    expect([PriorityBand.LOW, PriorityBand.MEDIUM]).toContain(result.band);
  });

  it('should clamp scores between 0 and 100 and never yield NaN', () => {
    const extremeHigh = priorityService.calculatePriority({
      severity: 100, // Invalid extreme
      confidence: 5.0,
      affectedRadius: 10000,
      persistenceDays: 100,
      signalCount: 50,
      reportCount: 50,
    });
    expect(extremeHigh.score).toBeLessThanOrEqual(100);
    expect(isNaN(extremeHigh.score)).toBe(false);

    const extremeEmpty = priorityService.calculatePriority({
      severity: undefined as any,
      confidence: undefined as any,
    });
    expect(extremeEmpty.score).toBeGreaterThanOrEqual(0);
    expect(extremeEmpty.score).toBeLessThanOrEqual(100);
    expect(isNaN(extremeEmpty.score)).toBe(false);
  });

  it('should provide transparent human-readable explanations in the output', () => {
    const result = priorityService.calculatePriority({
      severity: 9,
      confidence: 0.95,
      category: 'ELECTRICAL_HAZARD',
      persistenceDays: 2,
      signalCount: 3,
      locationName: 'Hostel Gate',
    });

    expect(result.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining('physical hazard severity'),
        expect.stringContaining('Corroborated by'),
      ])
    );
  });
});
