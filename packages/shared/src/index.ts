// PATCHPULSE — Shared Types & Constants
// Hackday 1.0 - TECH FOR A BETTER TOMORROW
// Participant: Pochiraju Kailash Ram Markandeya Sharma | Team: kailashsharma8

export enum UserRole {
  CITIZEN = 'CITIZEN',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

export enum SignalType {
  PHOTO = 'PHOTO',
  TEXT = 'TEXT',
  VOICE = 'VOICE',
  LOCATION = 'LOCATION',
  TIME = 'TIME',
  CONFIRMATION = 'CONFIRMATION',
  HISTORICAL = 'HISTORICAL',
  SYSTEM = 'SYSTEM',
}

export enum IssueCategory {
  STREETLIGHT = 'STREETLIGHT',
  POTHOLE = 'POTHOLE',
  GARBAGE_OVERFLOW = 'GARBAGE_OVERFLOW',
  WATER_LEAKAGE = 'WATER_LEAKAGE',
  DAMAGED_SIDEWALK = 'DAMAGED_SIDEWALK',
  BLOCKED_DRAIN = 'BLOCKED_DRAIN',
  DAMAGED_BENCH = 'DAMAGED_BENCH',
  ELECTRICAL_HAZARD = 'ELECTRICAL_HAZARD',
  ACCESSIBILITY_ISSUE = 'ACCESSIBILITY_ISSUE',
  UNSAFE_PATHWAY = 'UNSAFE_PATHWAY',
  OTHER = 'OTHER',
}

export enum IssueStatus {
  DETECTED = 'DETECTED',
  CORROBORATING = 'CORROBORATING',
  PRIORITIZED = 'PRIORITIZED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED_PENDING_VERIFICATION = 'RESOLVED_PENDING_VERIFICATION',
  VERIFIED_RESOLVED = 'VERIFIED_RESOLVED',
  REOPENED = 'REOPENED',
  CLOSED = 'CLOSED',
}

export enum WorkOrderStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  VERIFIED = 'VERIFIED',
  REOPENED = 'REOPENED',
  CLOSED = 'CLOSED',
}

export enum VerificationStatus {
  VERIFIED_RESOLVED = 'VERIFIED_RESOLVED',
  REOPENED_FOR_REVIEW = 'REOPENED_FOR_REVIEW',
}

export enum PriorityBand {
  LOW = 'LOW',         // 0 - 29
  MEDIUM = 'MEDIUM',   // 30 - 54
  HIGH = 'HIGH',       // 55 - 74
  CRITICAL = 'CRITICAL' // 75 - 100
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PriorityBreakdown {
  score: number; // 0-100
  band: PriorityBand;
  factors: {
    severity: number;      // 0-100
    impact: number;        // 0-100
    persistence: number;   // 0-100
    confidence: number;    // 0-100
    vulnerability: number; // 0-100
    urgency: number;       // 0-100
  };
  weights: {
    severity: number;      // e.g. 0.25
    impact: number;        // e.g. 0.20
    persistence: number;   // e.g. 0.15
    confidence: number;    // e.g. 0.15
    vulnerability: number; // e.g. 0.15
    urgency: number;       // e.g. 0.10
  };
  reasons: string[];
}

export interface ClusteringScore {
  compositeScore: number; // 0-1
  isMatch: boolean;
  breakdown: {
    semanticSimilarity: number;  // 0-1
    locationSimilarity: number;  // 0-1 (Haversine proximity)
    categorySimilarity: number;  // 0-1
    temporalSimilarity: number;  // 0-1
    distanceMeters: number;
  };
  threshold: number; // e.g. 0.78
}

export interface IssueFingerprintDto {
  issueId: string;
  canonicalCategory: IssueCategory;
  canonicalSummary: string;
  locationName: string;
  latitude: number;
  longitude: number;
  confidence: number; // 0-1
  severity: number;   // 1-10
  priorityScore: number; // 0-100
  priorityBand: PriorityBand;
  affectedRadiusMeters: number;
  persistenceScore: number;
  impactScore: number;
  vulnerabilityScore: number;
  status: IssueStatus;
  firstDetectedAt: string;
  lastDetectedAt: string;
  signalCount: number;
  reportCount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  details?: any;
}

export interface DemoStep {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  signalType?: SignalType;
  confidence?: number;
  priorityScore?: number;
  status?: IssueStatus;
  workOrderId?: string;
  verificationConfidence?: number;
  timestamp: string;
}

// Configurable constants & defaults
export const DEFAULT_PRIORITY_WEIGHTS = {
  severity: 0.25,
  impact: 0.20,
  persistence: 0.15,
  confidence: 0.15,
  vulnerability: 0.15,
  urgency: 0.10,
};

export const DEFAULT_CLUSTERING_WEIGHTS = {
  semantic: 0.45,
  location: 0.30,
  category: 0.15,
  temporal: 0.10,
};

export const DEFAULT_CLUSTERING_THRESHOLD = 0.78;
export const DEFAULT_MAX_CLUSTER_DISTANCE_METERS = 150; // meters

export function getPriorityBand(score: number): PriorityBand {
  if (score >= 75) return PriorityBand.CRITICAL;
  if (score >= 55) return PriorityBand.HIGH;
  if (score >= 30) return PriorityBand.MEDIUM;
  return PriorityBand.LOW;
}
