import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Deterministic SHA-256 password hasher with salt for demo reliability
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`patchpulse_salt_${password}`).digest('hex');
}

async function main() {
  console.log('🌱 Seeding PATCHPULSE database for HACKDAY 1.0...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { code: 'IIT-SMART-CAMPUS' },
    update: {},
    create: {
      name: 'Smart Tech University — Central Campus',
      code: 'IIT-SMART-CAMPUS',
      type: 'CAMPUS',
      settings: JSON.stringify({
        defaultPriorityThreshold: 75,
        clusteringRadiusMeters: 150,
        enableAutoWorkOrders: true,
      }),
    },
  });

  // 2. Demo Users
  const passwordHash = hashPassword('Pass@12345');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@patchpulse.demo' },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email: 'admin@patchpulse.demo',
      name: 'Dr. Ramesh Sharma (Chief Campus Administrator)',
      role: 'ADMIN',
      passwordHash,
      organizationId: org.id,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@patchpulse.demo' },
    update: { passwordHash, role: 'OPERATOR' },
    create: {
      email: 'operator@patchpulse.demo',
      name: 'Vikram Singh (Facility Operations Lead)',
      role: 'OPERATOR',
      passwordHash,
      organizationId: org.id,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
  });

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@patchpulse.demo' },
    update: { passwordHash, role: 'CITIZEN' },
    create: {
      email: 'citizen@patchpulse.demo',
      name: 'Ananya Verma (Student Resident, Hostel 4)',
      role: 'CITIZEN',
      passwordHash,
      organizationId: org.id,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const tech = await prisma.user.upsert({
    where: { email: 'tech@patchpulse.demo' },
    update: { passwordHash, role: 'OPERATOR' },
    create: {
      email: 'tech@patchpulse.demo',
      name: 'Manoj Kumar (Senior Electrical Specialist)',
      role: 'OPERATOR',
      passwordHash,
      organizationId: org.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  // 3. Campus Locations
  const locationsData = [
    { name: 'Block C Parking Area', zone: 'NORTH_CAMPUS', lat: 12.9915, lng: 80.2337, radius: 120.0 },
    { name: 'Hostel Gate & Walkway', zone: 'HOSTEL_ZONE', lat: 12.9928, lng: 80.2312, radius: 100.0 },
    { name: 'Campus Main Gate', zone: 'PERIMETER', lat: 12.9890, lng: 80.2375, radius: 150.0 },
    { name: 'Academic Complex & Lecture Quad', zone: 'ACADEMIC_ZONE', lat: 12.9902, lng: 80.2341, radius: 140.0 },
    { name: 'Central Library Road', zone: 'CENTRAL_ZONE', lat: 12.9910, lng: 80.2355, radius: 100.0 },
    { name: 'Student Food Court & Plaza', zone: 'AMENITY_ZONE', lat: 12.9922, lng: 80.2328, radius: 110.0 },
    { name: 'Sports & Gymnasium Complex', zone: 'RECREATION_ZONE', lat: 12.9935, lng: 80.2360, radius: 160.0 },
    { name: 'Faculty Residential Enclave', zone: 'RESIDENTIAL_ZONE', lat: 12.9880, lng: 80.2320, radius: 180.0 },
  ];

  const locations: Record<string, any> = {};
  for (const loc of locationsData) {
    const createdLoc = await prisma.location.create({
      data: {
        name: loc.name,
        zone: loc.zone,
        latitude: loc.lat,
        longitude: loc.lng,
        radiusMeters: loc.radius,
        organizationId: org.id,
      },
    });
    locations[loc.name] = createdLoc;
  }

  // 4. Issue Categories
  const categories = [
    { code: 'STREETLIGHT', name: 'Streetlight Failure', icon: 'Lightbulb', defaultSeverity: 8, description: 'Broken luminaire, unlit path, flickering lamp' },
    { code: 'POTHOLE', name: 'Pothole / Road Damage', icon: 'AlertTriangle', defaultSeverity: 7, description: 'Asphalt crater, cracked road surface' },
    { code: 'GARBAGE_OVERFLOW', name: 'Garbage Overflow', icon: 'Trash2', defaultSeverity: 6, description: 'Overflowing dumpster, scattered litter' },
    { code: 'WATER_LEAKAGE', name: 'Water Leakage / Pipe Burst', icon: 'Droplets', defaultSeverity: 7, description: 'Broken pipeline, continuous fresh water leak' },
    { code: 'DAMAGED_SIDEWALK', name: 'Damaged Sidewalk', icon: 'Footprints', defaultSeverity: 5, description: 'Uneven paving slabs, tripping hazard' },
    { code: 'BLOCKED_DRAIN', name: 'Blocked Drain / Flooding', icon: 'CloudRain', defaultSeverity: 7, description: 'Debris-choked stormwater drain, pooling water' },
    { code: 'DAMAGED_BENCH', name: 'Damaged Public Asset', icon: 'Armchair', defaultSeverity: 4, description: 'Broken seating, vandalized campus furniture' },
    { code: 'ELECTRICAL_HAZARD', name: 'Exposed Wiring / Hazard', icon: 'Zap', defaultSeverity: 9, description: 'Exposed electrical cable, sparking junction box' },
    { code: 'ACCESSIBILITY_ISSUE', name: 'Accessibility Obstruction', icon: 'Accessibility', defaultSeverity: 6, description: 'Blocked wheelchair ramp, missing railing' },
    { code: 'UNSAFE_PATHWAY', name: 'Unsafe Pathway', icon: 'ShieldAlert', defaultSeverity: 8, description: 'Overgrown vegetation blocking visibility at night' },
  ];

  for (const cat of categories) {
    await prisma.issueCategory.upsert({
      where: { code: cat.code },
      update: cat,
      create: cat,
    });
  }

  // 5. FLAGSHIP ISSUE #P-024 (Section 42 in Specification)
  // Clean existing flagship issue if present
  await prisma.verification.deleteMany({ where: { issueId: 'P-024' } });
  await prisma.workOrder.deleteMany({ where: { issueId: 'P-024' } });
  await prisma.issueSignal.deleteMany({ where: { issueId: 'P-024' } });
  await prisma.issueReport.deleteMany({ where: { issueId: 'P-024' } });
  await prisma.signal.deleteMany({ where: { issueId: 'P-024' } });
  await prisma.report.deleteMany({ where: { issueId: 'P-024' } });
  await prisma.issue.deleteMany({ where: { id: 'P-024' } });

  const blockC = locations['Block C Parking Area'];

  const issueP024 = await prisma.issue.create({
    data: {
      id: 'P-024',
      canonicalCategory: 'STREETLIGHT',
      canonicalSummary: 'Streetlight failure and severe darkness near Block C Parking Area',
      locationName: 'Block C Parking Area',
      latitude: blockC.latitude,
      longitude: blockC.longitude,
      locationId: blockC.id,
      organizationId: org.id,
      status: 'ASSIGNED',
      confidence: 0.94,
      severity: 8,
      priorityScore: 91.0,
      priorityBand: 'CRITICAL',
      affectedRadius: 120.0,
      persistenceScore: 85.0,
      impactScore: 92.0,
      vulnerabilityScore: 90.0,
      urgencyScore: 95.0,
      signalCount: 4,
      reportCount: 3,
      isDemoRecord: true,
      firstDetectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days persistence
      lastDetectedAt: new Date(),
      priorityReasoning: JSON.stringify({
        score: 91,
        band: 'CRITICAL',
        factors: { severity: 80, impact: 92, persistence: 85, confidence: 94, vulnerability: 90, urgency: 95 },
        weights: { severity: 0.25, impact: 0.20, persistence: 0.15, confidence: 0.15, vulnerability: 0.15, urgency: 0.10 },
        reasons: [
          'High pedestrian activity zone connecting student hostels to dining facility (+22)',
          'Complete night-time blackout posing safety and security vulnerability (+24)',
          'Continuous 5-day persistence without resolution (+18)',
          'Corroborated by 3 independent multi-modal citizen reports (+15)',
          'AI Vision confidence 94% confirming defective luminaire fixture (+12)',
        ],
      }),
    },
  });

  // Reports for P-024
  const report1 = await prisma.report.create({
    data: {
      userId: citizen.id,
      issueId: issueP024.id,
      description: 'The streetlight near the parking area is not working and the path is completely pitch black.',
      mediaUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800',
      latitude: 12.99155,
      longitude: 80.23372,
      status: 'CLUSTERED',
      aiCategory: 'STREETLIGHT',
      aiConfidence: 0.94,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const report2 = await prisma.report.create({
    data: {
      userId: citizen.id,
      issueId: issueP024.id,
      description: 'It is very dark near Block C parking. Girls walking back from the lab feel unsafe.',
      latitude: 12.99148,
      longitude: 80.23381,
      status: 'CLUSTERED',
      aiCategory: 'STREETLIGHT',
      aiConfidence: 0.91,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const report3 = await prisma.report.create({
    data: {
      userId: citizen.id,
      issueId: issueP024.id,
      description: 'Voice complaint: The light beside Block C parking area has been broken for days.',
      voiceUrl: 'https://cdn.example.com/audio/voice-report-024.mp3',
      transcription: 'The light beside Block C parking area is broken, please send someone to fix it.',
      latitude: 12.99160,
      longitude: 80.23365,
      status: 'CLUSTERED',
      aiCategory: 'STREETLIGHT',
      aiConfidence: 0.93,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  });

  // Signals for P-024
  const sig1 = await prisma.signal.create({
    data: {
      issueId: issueP024.id,
      reportId: report1.id,
      type: 'PHOTO',
      source: 'CITIZEN_MOBILE_APP',
      content: 'Uploaded high-contrast evening photo showing unlit 150W pole fixture and dark ground surface.',
      confidence: 0.95,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const sig2 = await prisma.signal.create({
    data: {
      issueId: issueP024.id,
      reportId: report2.id,
      type: 'TEXT',
      source: 'CAMPUS_PULSE_WEB',
      content: 'Text report referencing safety hazard and night-time darkness at Block C.',
      confidence: 0.90,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const sig3 = await prisma.signal.create({
    data: {
      issueId: issueP024.id,
      reportId: report3.id,
      type: 'VOICE',
      source: 'CAMPUS_VOICE_GATEWAY',
      content: 'Audio transcription: The light beside Block C parking area is broken.',
      confidence: 0.93,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  });

  const sig4 = await prisma.signal.create({
    data: {
      issueId: issueP024.id,
      type: 'HISTORICAL',
      source: 'FACILITY_TELEMETRY',
      content: 'Historical circuit telemetry indicates scheduled 18:30 activation received zero current draw.',
      confidence: 0.98,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Associations
  await prisma.issueReport.createMany({
    data: [
      { issueId: issueP024.id, reportId: report1.id, weight: 1.0 },
      { issueId: issueP024.id, reportId: report2.id, weight: 0.9 },
      { issueId: issueP024.id, reportId: report3.id, weight: 0.95 },
    ],
  });

  await prisma.issueSignal.createMany({
    data: [
      { issueId: issueP024.id, signalId: sig1.id, relevance: 1.0 },
      { issueId: issueP024.id, signalId: sig2.id, relevance: 0.9 },
      { issueId: issueP024.id, signalId: sig3.id, relevance: 0.95 },
      { issueId: issueP024.id, signalId: sig4.id, relevance: 1.0 },
    ],
  });

  // Actionable Work Order PX-0192 for P-024 (Section 23, 42)
  await prisma.workOrder.create({
    data: {
      id: 'PX-0192',
      issueId: issueP024.id,
      summary: 'Emergency streetlight luminaire replacement and line inspection at Block C Parking Area',
      priority: 'CRITICAL',
      recommendedAction: 'Inspect terminal box at pole base, check 230V feeder, and replace damaged 150W LED driver fixture.',
      requiredTeam: 'Electrical Maintenance Unit 2 (High-Voltage Aerial Team)',
      suggestedEquipment: 'Hydraulic boom lift truck, 150W IP66 LED Luminaire, Fluke True-RMS Multimeter, Insulated lineman kit',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'ASSIGNED',
      assignedToUserId: tech.id,
      notes: 'High priority due to evening pedestrian traffic and student safety vulnerability.',
    },
  });

  // 6. RESOLVED ISSUE #P-018 with Before/After Verification (Section 25)
  const libRoad = locations['Central Library Road'];
  const issueP018 = await prisma.issue.upsert({
    where: { id: 'P-018' },
    update: {},
    create: {
      id: 'P-018',
      canonicalCategory: 'WATER_LEAKAGE',
      canonicalSummary: 'High-pressure potable water line rupture flooding Central Library Road',
      locationName: 'Central Library Road',
      latitude: libRoad.latitude,
      longitude: libRoad.longitude,
      locationId: libRoad.id,
      organizationId: org.id,
      status: 'VERIFIED_RESOLVED',
      confidence: 0.97,
      severity: 7,
      priorityScore: 79.0,
      priorityBand: 'CRITICAL',
      affectedRadius: 60.0,
      persistenceScore: 40.0,
      impactScore: 88.0,
      vulnerabilityScore: 70.0,
      urgencyScore: 90.0,
      signalCount: 3,
      reportCount: 2,
      isDemoRecord: true,
      priorityReasoning: JSON.stringify({
        score: 79,
        band: 'CRITICAL',
        factors: { severity: 70, impact: 88, persistence: 40, confidence: 97, vulnerability: 70, urgency: 90 },
        reasons: ['Severe potable water wastage and surface erosion', 'Main library pedestrian access compromised'],
      }),
    },
  });

  const woP018 = await prisma.workOrder.upsert({
    where: { id: 'PX-0181' },
    update: {},
    create: {
      id: 'PX-0181',
      issueId: issueP018.id,
      summary: 'Main waterline excavation and clamp seal repair on Library Road',
      priority: 'CRITICAL',
      recommendedAction: 'Isolate Sector 3 valve, excavate 1.2m trench, install stainless repair clamp.',
      requiredTeam: 'Civil Hydraulics Rapid Response',
      suggestedEquipment: 'Mini excavator, 3-inch submersible pump, pipe clamp 90mm',
      status: 'VERIFIED',
      assignedToUserId: tech.id,
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  });

  await prisma.verification.create({
    data: {
      issueId: issueP018.id,
      workOrderId: woP018.id,
      beforeImageUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800',
      afterImageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800',
      visualChangeScore: 0.96,
      resolutionConfidence: 0.98,
      detectedBeforeState: 'Continuous pressurized surface water bubbling, severe asphalt pooling over 45 square meters.',
      detectedAfterState: 'Excavation backfilled and asphalt patch sealed; zero standing moisture detected.',
      recommendation: 'VERIFIED RESOLVED: Ground telemetry and visual inspection verify defect has been successfully rectified.',
      status: 'VERIFIED_RESOLVED',
      verifiedByUserId: operator.id,
      verifiedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },
  });

  // 7. OTHER ACTIVE CAMPUS ISSUES
  const hostelGate = locations['Hostel Gate & Walkway'];
  await prisma.issue.upsert({
    where: { id: 'P-031' },
    update: {},
    create: {
      id: 'P-031',
      canonicalCategory: 'POTHOLE',
      canonicalSummary: 'Deep asphalt pothole causing vehicle damage on Hostel Gate approach',
      locationName: 'Hostel Gate & Walkway',
      latitude: hostelGate.latitude,
      longitude: hostelGate.longitude,
      locationId: hostelGate.id,
      organizationId: org.id,
      status: 'IN_PROGRESS',
      confidence: 0.92,
      severity: 7,
      priorityScore: 74.0,
      priorityBand: 'HIGH',
      affectedRadius: 40.0,
      signalCount: 2,
      reportCount: 2,
      isDemoRecord: true,
      priorityReasoning: JSON.stringify({
        score: 74,
        band: 'HIGH',
        factors: { severity: 70, impact: 75, persistence: 60, confidence: 92, vulnerability: 80, urgency: 75 },
        reasons: ['Sharp asphalt rim risking two-wheeler accidents at hostel entry', 'High cycle and campus bus traffic'],
      }),
    },
  });

  const foodCourt = locations['Student Food Court & Plaza'];
  await prisma.issue.upsert({
    where: { id: 'P-042' },
    update: {},
    create: {
      id: 'P-042',
      canonicalCategory: 'GARBAGE_OVERFLOW',
      canonicalSummary: 'Overflowing organic waste bins attracting stray animals behind Food Court',
      locationName: 'Student Food Court & Plaza',
      latitude: foodCourt.latitude,
      longitude: foodCourt.longitude,
      locationId: foodCourt.id,
      organizationId: org.id,
      status: 'DETECTED',
      confidence: 0.88,
      severity: 6,
      priorityScore: 61.0,
      priorityBand: 'HIGH',
      affectedRadius: 30.0,
      signalCount: 1,
      reportCount: 1,
      isDemoRecord: true,
    },
  });

  const quad = locations['Academic Complex & Lecture Quad'];
  await prisma.issue.upsert({
    where: { id: 'P-055' },
    update: {},
    create: {
      id: 'P-055',
      canonicalCategory: 'BLOCKED_DRAIN',
      canonicalSummary: 'Stormwater drain silt accumulation causing walkway flooding near Lecture Hall 3',
      locationName: 'Academic Complex & Lecture Quad',
      latitude: quad.latitude,
      longitude: quad.longitude,
      locationId: quad.id,
      organizationId: org.id,
      status: 'CORROBORATING',
      confidence: 0.84,
      severity: 6,
      priorityScore: 58.0,
      priorityBand: 'HIGH',
      affectedRadius: 50.0,
      signalCount: 2,
      reportCount: 2,
      isDemoRecord: true,
    },
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'CRITICAL Priority Escalation: Issue #P-024',
        message: 'Streetlight failure at Block C Parking Area escalated to Priority 91 (CRITICAL) after 3 multi-modal corroborations.',
        type: 'ALERT',
        link: '/issues/P-024',
      },
      {
        userId: operator.id,
        title: 'Work Order Dispatched: #PX-0192',
        message: 'Work order for emergency streetlight luminaire replacement assigned to Manoj Kumar.',
        type: 'INFO',
        link: '/work-orders/PX-0192',
      },
      {
        userId: citizen.id,
        title: 'Your Report Has Been Corroborated',
        message: 'Your report on Block C parking darkness has been unified into Issue #P-024 and scheduled for repair.',
        type: 'SUCCESS',
        link: '/issues/P-024',
      },
    ],
  });

  // 9. System Configuration
  await prisma.systemConfig.upsert({
    where: { key: 'PRIORITY_WEIGHTS' },
    update: {},
    create: {
      key: 'PRIORITY_WEIGHTS',
      value: JSON.stringify({
        severity: 0.25,
        impact: 0.20,
        persistence: 0.15,
        confidence: 0.15,
        vulnerability: 0.15,
        urgency: 0.10,
      }),
      description: 'Explainable Priority Engine multi-dimensional weights',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'CLUSTERING_CONFIG' },
    update: {},
    create: {
      key: 'CLUSTERING_CONFIG',
      value: JSON.stringify({
        threshold: 0.78,
        maxRadiusMeters: 150,
        weights: {
          semantic: 0.45,
          location: 0.30,
          category: 0.15,
          temporal: 0.10,
        },
      }),
      description: 'PULSE-5 clustering parameters and spatial-semantic weights',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'AI_MODE' },
    update: {},
    create: {
      key: 'AI_MODE',
      value: JSON.stringify({ mode: 'mock', status: 'ACTIVE_DETERMINISTIC' }),
      description: 'AI processing mode setting',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('--- DEMO CREDENTIALS ---');
  console.log('Admin:    admin@patchpulse.demo    / Pass@12345');
  console.log('Operator: operator@patchpulse.demo / Pass@12345');
  console.log('Citizen:  citizen@patchpulse.demo  / Pass@12345');
  console.log('------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
