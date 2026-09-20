import { Injectable } from '@nestjs/common';
import { PriorityBand, PriorityBreakdown, getPriorityBand } from '@patchpulse/shared';

export interface PriorityInput {
  severity: number;           // 1-10
  confidence: number;         // 0-1
  affectedRadius?: number;    // meters
  persistenceDays?: number;   // days since first detected
  signalCount?: number;       // total corroborating signals
  reportCount?: number;       // total user reports
  category?: string;          // STREETLIGHT, POTHOLE, etc.
  locationName?: string;      // e.g. "Block C Parking Area"
  isNightTime?: boolean;
}

@Injectable()
export class PriorityService {
  // Configurable weights (Section 16)
  private weights = {
    severity: 0.25,
    impact: 0.20,
    persistence: 0.15,
    confidence: 0.15,
    vulnerability: 0.15,
    urgency: 0.10,
  };

  /**
   * Calculates an explainable priority score (0-100) with human-readable rationale
   */
  calculatePriority(input: PriorityInput): PriorityBreakdown {
    // 1. Severity factor (0-100)
    const rawSeverity = Math.min(10, Math.max(1, input.severity || 5));
    const severityFactor = rawSeverity * 10;

    // 2. Impact factor (0-100)
    const radius = input.affectedRadius || 50;
    let impactFactor = Math.min(100, Math.max(20, (radius / 150) * 100));
    const loc = (input.locationName || '').toLowerCase();
    if (loc.includes('hostel') || loc.includes('parking') || loc.includes('gate') || loc.includes('academic')) {
      impactFactor = Math.min(100, impactFactor + 25);
    }

    // 3. Persistence factor (0-100)
    const days = Math.max(0, input.persistenceDays || 0);
    const persistenceFactor = Math.min(100, days * 18 + ((input.reportCount || 1) - 1) * 10);

    // 4. Confidence factor (0-100)
    const rawConfidence = Math.min(1, Math.max(0.1, input.confidence || 0.6));
    const corroborationBonus = Math.min(20, ((input.signalCount || 1) - 1) * 7);
    const confidenceFactor = Math.min(100, rawConfidence * 80 + corroborationBonus);

    // 5. Vulnerability factor (0-100)
    let vulnerabilityFactor = 40;
    const cat = (input.category || '').toUpperCase();
    if (cat === 'ELECTRICAL_HAZARD') vulnerabilityFactor = 95;
    else if (cat === 'STREETLIGHT') vulnerabilityFactor = 85;
    else if (cat === 'ACCESSIBILITY_ISSUE') vulnerabilityFactor = 80;
    else if (cat === 'WATER_LEAKAGE') vulnerabilityFactor = 75;
    else if (cat === 'POTHOLE') vulnerabilityFactor = 70;

    if (input.isNightTime && (cat === 'STREETLIGHT' || cat === 'UNSAFE_PATHWAY')) {
      vulnerabilityFactor = Math.min(100, vulnerabilityFactor + 15);
    }

    // 6. Urgency factor (0-100)
    const urgencyFactor = Math.min(100, Math.max(30, (input.reportCount || 1) * 22 + (input.signalCount || 1) * 10));

    // Weighted formula (Section 16)
    const rawScore =
      this.weights.severity * severityFactor +
      this.weights.impact * impactFactor +
      this.weights.persistence * persistenceFactor +
      this.weights.confidence * confidenceFactor +
      this.weights.vulnerability * vulnerabilityFactor +
      this.weights.urgency * urgencyFactor;

    // Safety clamps: never NaN, undefined, < 0, or > 100
    const finalScore = isNaN(rawScore) ? 50 : Math.min(100, Math.max(0, Math.round(rawScore)));
    const band = getPriorityBand(finalScore);

    // Human-readable transparent explanation breakdown (Section 17)
    const reasons: string[] = [];

    if (severityFactor >= 70) {
      reasons.push(`High inherent physical hazard severity (${rawSeverity}/10)`);
    }
    if (impactFactor >= 75) {
      reasons.push(`Critical pedestrian conduit located near ${input.locationName || 'key campus facilities'}`);
    }
    if (days >= 2) {
      reasons.push(`Unresolved issue persistence over ${days.toFixed(1)} days`);
    }
    if ((input.signalCount || 1) >= 2) {
      reasons.push(`Corroborated by ${input.signalCount} multi-modal independent sensor and citizen signals`);
    }
    if (vulnerabilityFactor >= 75) {
      reasons.push(`Vulnerable demographic exposure (${cat.replace(/_/g, ' ')}) in active evening hours`);
    }
    if (confidenceFactor >= 85) {
      reasons.push(`Multi-source AI confidence validation at ${Math.round(rawConfidence * 100)}%`);
    }

    if (reasons.length === 0) {
      reasons.push('Standard campus maintenance priority baseline');
    }

    return {
      score: finalScore,
      band,
      factors: {
        severity: Math.round(severityFactor),
        impact: Math.round(impactFactor),
        persistence: Math.round(persistenceFactor),
        confidence: Math.round(confidenceFactor),
        vulnerability: Math.round(vulnerabilityFactor),
        urgency: Math.round(urgencyFactor),
      },
      weights: this.weights,
      reasons,
    };
  }
}
