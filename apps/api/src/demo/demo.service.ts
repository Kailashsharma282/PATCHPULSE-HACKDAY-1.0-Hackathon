import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SimulationState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  stepData: {
    title: string;
    description: string;
    category?: string;
    confidence?: number;
    priorityScore?: number;
    priorityBand?: string;
    issueId?: string;
    workOrderId?: string;
    signalsCount?: number;
    verificationConfidence?: number;
    status?: string;
    badge?: string;
    details?: any;
  };
}

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);
  private currentStep = 1;
  private isPlaying = false;

  private readonly steps = [
    {
      step: 1,
      title: 'Signal 1: Citizen Photo Uploaded',
      description: 'Ananya Verma (Student, Hostel 4) captures a photo of a dark, non-functioning luminaire near Block C Parking Area.',
      category: 'STREETLIGHT',
      confidence: 0.61,
      priorityScore: 54,
      priorityBand: 'MEDIUM',
      issueId: 'P-024',
      signalsCount: 1,
      status: 'DETECTED',
      badge: 'WEAK SIGNAL DETECTED',
      details: {
        source: 'MOBILE_APP_CAMERA',
        location: 'Block C Parking Area (12.99155, 80.23372)',
        notes: 'Low ambient illumination, dark pedestrian corridor',
      },
    },
    {
      step: 2,
      title: 'Perceive: Signal Ingested to Live Pulse Stream',
      description: 'PATCHPULSE live telemetry ingests the raw image and metadata. Initial weak signal indexed into geospatial grid.',
      category: 'STREETLIGHT',
      confidence: 0.65,
      priorityScore: 56,
      priorityBand: 'MEDIUM',
      issueId: 'P-024',
      signalsCount: 1,
      status: 'DETECTED',
      badge: 'SIGNAL INDEXED',
      details: {
        telemetry: 'Grid Cell #NC-4402',
        timestamp: '20:14:02 IST',
      },
    },
    {
      step: 3,
      title: 'Learn: AI Multi-Modal Feature Extraction',
      description: 'AI vision pipeline identifies 150W pole-mounted luminaire head with zero lux emission in night ambient setting.',
      category: 'STREETLIGHT',
      confidence: 0.72,
      priorityScore: 62,
      priorityBand: 'HIGH',
      issueId: 'P-024',
      signalsCount: 1,
      status: 'DETECTED',
      badge: 'AI CLASSIFICATION',
      details: {
        visionFeatures: ['Broken LED driver module', '0 lux reading', 'High-contrast shadow'],
        inferredSeverity: '8/10',
      },
    },
    {
      step: 4,
      title: 'Signal 2: Nearby Citizen Text Report',
      description: 'Second student submits text note: "It is very dark near Block C parking. Girls walking back feel unsafe."',
      category: 'STREETLIGHT',
      confidence: 0.76,
      priorityScore: 68,
      priorityBand: 'HIGH',
      issueId: 'P-024',
      signalsCount: 2,
      status: 'CORROBORATING',
      badge: 'INDEPENDENT CORROBORATION',
      details: {
        distanceFromSignal1: '24 meters',
        timeDelta: '14 minutes',
      },
    },
    {
      step: 5,
      title: 'Unify: Multi-Dimensional AI Clustering Triggered',
      description: 'Clustering engine calculates 4-factor composite similarity: Semantic (0.88) + Spatial (0.94) + Category (1.0) + Temporal (0.92) = 0.91 >= 0.78 threshold.',
      category: 'STREETLIGHT',
      confidence: 0.84,
      priorityScore: 78,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      signalsCount: 2,
      status: 'CORROBORATING',
      badge: 'CLUSTER MERGE',
      details: {
        clusteringScore: 0.91,
        deduplicationAction: 'Unified under Issue #P-024 (Zero duplicate clutter created)',
      },
    },
    {
      step: 6,
      title: 'Signal 3: Citizen Voice Report Transcription',
      description: 'Voice hotline receives audio report. Speech-to-text transcribes: "The light beside Block C parking is broken, please fix it."',
      category: 'STREETLIGHT',
      confidence: 0.89,
      priorityScore: 84,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      signalsCount: 3,
      status: 'CORROBORATING',
      badge: 'VOICE FUSED',
      details: {
        audioDuration: '6.4s',
        transcriptionConfidence: '98%',
      },
    },
    {
      step: 7,
      title: 'Signal 4: Historical Circuit Telemetry Corroboration',
      description: 'Historical facility telemetry indicates scheduled 18:30 activation received zero current draw over the past 5 evenings.',
      category: 'STREETLIGHT',
      confidence: 0.94,
      priorityScore: 88,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      signalsCount: 4,
      status: 'PRIORITIZED',
      badge: '5-DAY PERSISTENCE DETECTED',
      details: {
        telemetrySensor: 'Feeder Panel 3B',
        consecutiveDaysUnresolved: 5,
      },
    },
    {
      step: 8,
      title: 'Score: Explainable Priority Escalation to 91',
      description: 'Explainable Priority Engine calculates transparent score: Night-time pedestrian vulnerability (+24), 5-day persistence (+18), 3 citizen reports (+15).',
      category: 'STREETLIGHT',
      confidence: 0.94,
      priorityScore: 91,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      signalsCount: 4,
      status: 'PRIORITIZED',
      badge: 'CRITICAL ESCALATION (91/100)',
      details: {
        severityWeight: 0.25,
        impactWeight: 0.20,
        persistenceWeight: 0.15,
        confidenceWeight: 0.15,
        vulnerabilityWeight: 0.15,
        urgencyWeight: 0.10,
      },
    },
    {
      step: 9,
      title: 'Action: Work Order #PX-0192 Auto-Generated',
      description: 'Actionable work order created with AI-recommended tooling: Boom lift truck, 150W IP66 LED Luminaire, Fluke Multimeter.',
      category: 'STREETLIGHT',
      confidence: 0.94,
      priorityScore: 91,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      workOrderId: 'PX-0192',
      signalsCount: 4,
      status: 'ASSIGNED',
      badge: 'WORK ORDER DISPATCHED',
      details: {
        requiredTeam: 'Electrical Maintenance Unit 2',
        suggestedEquipment: 'Hydraulic boom lift truck, 150W IP66 Luminaire, Lineman kit',
        deadline: '24 Hours',
      },
    },
    {
      step: 10,
      title: 'Dispatch: Field Technician Manoj Kumar Assigned',
      description: 'Operations Lead Vikram Singh assigns high-voltage aerial team. Technician Manoj Kumar acknowledges dispatch notification.',
      category: 'STREETLIGHT',
      confidence: 0.94,
      priorityScore: 91,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      workOrderId: 'PX-0192',
      signalsCount: 4,
      status: 'IN_PROGRESS',
      badge: 'CREW ON SITE',
      details: {
        technician: 'Manoj Kumar (Senior Electrical Specialist)',
        crewStatus: 'En route with boom truck',
      },
    },
    {
      step: 11,
      title: 'Repair Complete: After-Repair Photographic Evidence Uploaded',
      description: 'Technician replaces defective LED driver, tests 230V circuit, and uploads photographic proof of the illuminated luminaire.',
      category: 'STREETLIGHT',
      confidence: 0.94,
      priorityScore: 91,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      workOrderId: 'PX-0192',
      signalsCount: 5,
      status: 'RESOLVED_PENDING_VERIFICATION',
      badge: 'EVIDENCE SUBMITTED',
      details: {
        replacementPart: 'Philips Lumileds 150W IP66 Luminaire Head',
        circuitCurrentDraw: '0.65 Amps (Nominal)',
      },
    },
    {
      step: 12,
      title: 'Evidence: AI Dual-Frame Visual Verification (97% Confidence)',
      description: 'AI compares Before vs After imagery. Visual change score: 94%. Lux coverage: uniform 80-lux. Zero residual defect detected.',
      category: 'STREETLIGHT',
      confidence: 0.97,
      priorityScore: 91,
      priorityBand: 'CRITICAL',
      issueId: 'P-024',
      workOrderId: 'PX-0192',
      verificationConfidence: 0.97,
      status: 'VERIFIED_RESOLVED',
      badge: 'AI VERIFICATION PASSED',
      details: {
        visualChangeScore: '94%',
        resolutionConfidence: '97%',
        aiRecommendation: 'VERIFIED RESOLVED: Ground telemetry and optical inspection confirm full defect rectification.',
      },
    },
    {
      step: 13,
      title: 'Lifecycle Complete: Issue #P-024 Verified Resolved',
      description: 'Full PULSE-5 lifecycle demonstrated: Weak signals perceived, unified without duplicate noise, explainably prioritized, actioned, and evidence-verified!',
      category: 'STREETLIGHT',
      confidence: 0.99,
      priorityScore: 0,
      priorityBand: 'LOW',
      issueId: 'P-024',
      workOrderId: 'PX-0192',
      verificationConfidence: 0.97,
      status: 'VERIFIED_RESOLVED',
      badge: 'INCIDENT CLOSED WITH PROOF',
      details: {
        totalResolutionTime: '3.2 Hours',
        citizenNotificationSent: true,
        noiseCompressionRate: '75% complaint reduction',
      },
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  getState(): SimulationState {
    const current = this.steps[this.currentStep - 1] || this.steps[0];
    return {
      currentStep: this.currentStep,
      totalSteps: this.steps.length,
      isPlaying: this.isPlaying,
      stepData: current,
    };
  }

  nextStep(): SimulationState {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    } else {
      this.currentStep = 1;
    }
    return this.getState();
  }

  previousStep(): SimulationState {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
    return this.getState();
  }

  setStep(step: number): SimulationState {
    if (step >= 1 && step <= this.steps.length) {
      this.currentStep = step;
    }
    return this.getState();
  }

  play(): SimulationState {
    this.isPlaying = true;
    return this.getState();
  }

  pause(): SimulationState {
    this.isPlaying = false;
    return this.getState();
  }

  async reset(): Promise<SimulationState> {
    this.currentStep = 1;
    this.isPlaying = false;

    // Reset flagship issue P-024 to clean state
    await this.prisma.issue.update({
      where: { id: 'P-024' },
      data: {
        status: 'ASSIGNED',
        priorityScore: 91.0,
        priorityBand: 'CRITICAL',
        signalCount: 4,
        reportCount: 3,
      },
    });

    return this.getState();
  }
}
