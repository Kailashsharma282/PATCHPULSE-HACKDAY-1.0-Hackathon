import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { ReportsService } from '../src/reports/reports.service';
import { IssuesService } from '../src/issues/issues.service';
import { WorkOrdersService } from '../src/work-orders/work-orders.service';
import { VerificationService } from '../src/verification/verification.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PATCHPULSE End-to-End Civic Intelligence Pipeline (Section 71)', () => {
  let moduleRef: TestingModule;
  let authService: AuthService;
  let reportsService: ReportsService;
  let issuesService: IssuesService;
  let workOrdersService: WorkOrdersService;
  let verificationService: VerificationService;
  let prisma: PrismaService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    reportsService = moduleRef.get<ReportsService>(ReportsService);
    issuesService = moduleRef.get<IssuesService>(IssuesService);
    workOrdersService = moduleRef.get<WorkOrdersService>(WorkOrdersService);
    verificationService = moduleRef.get<VerificationService>(VerificationService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('Complete Lifecycle: Signal Ingestion -> AI Clustering -> Priority Escalation -> Work Order -> AI Verification -> Verified Resolved', async () => {
    const timestamp = Date.now();
    const testEmail = `citizen_${timestamp}@patchpulse.demo`;

    // 1. Register Citizen User
    const regResult = await authService.register({
      name: 'E2E Test Citizen',
      email: testEmail,
      password: 'Pass@12345Password',
      role: 'CITIZEN',
    });
    expect(regResult.accessToken).toBeDefined();
    expect(regResult.user.email).toBe(testEmail);
    const citizenId = regResult.user.id;

    // 2. Submit Initial Weak Signal (Photo + Text)
    const report1 = await reportsService.createReport(citizenId, {
      description: 'The streetlight fixture at North Quad is completely broken and blacked out.',
      locationName: 'North Quad Pathway',
      latitude: 12.9950,
      longitude: 80.2350,
      mediaUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800',
    });

    expect(report1.report).toBeDefined();
    expect(report1.issue).toBeDefined();
    expect(report1.issue.canonicalCategory).toBe('STREETLIGHT');
    const createdIssueId = report1.issue.id;

    // 3. Submit Corroborating Signal (Nearby text note within 20 meters)
    const report2 = await reportsService.createReport(citizenId, {
      description: 'It is completely pitch dark near North Quad path, very unsafe at night.',
      locationName: 'North Quad Pathway',
      latitude: 12.9951, // ~15 meters away
      longitude: 80.2351,
    });

    // Should cluster with the existing issue rather than creating a duplicate
    expect(report2.isClustered).toBe(true);
    expect(report2.issue.id).toBe(createdIssueId);
    expect(report2.issue.signalCount).toBeGreaterThan(report1.issue.signalCount);
    // Priority escalates with corroboration
    expect(report2.issue.priorityScore).toBeGreaterThanOrEqual(report1.issue.priorityScore);

    // 4. Generate Actionable Work Order
    const workOrder = await workOrdersService.createWorkOrder({
      issueId: createdIssueId,
      summary: 'Emergency streetlight restoration at North Quad',
      requiredTeam: 'Electrical Maintenance Unit 2',
    });
    expect(workOrder.id).toBeDefined();
    expect(workOrder.issueId).toBe(createdIssueId);
    expect(workOrder.status).toBe('OPEN');

    // 5. Assign Work Order to Technician
    const assignedWo = await workOrdersService.updateStatus(workOrder.id, 'ASSIGNED');
    expect(assignedWo.status).toBe('ASSIGNED');

    // 6. Technician Moves to IN_PROGRESS
    const inProgressWo = await workOrdersService.updateStatus(workOrder.id, 'IN_PROGRESS');
    expect(inProgressWo.status).toBe('IN_PROGRESS');

    // 7. Work Completed
    const completedWo = await workOrdersService.updateStatus(workOrder.id, 'COMPLETED');
    expect(completedWo.status).toBe('COMPLETED');

    // 8. Upload After-Repair Photographic Evidence & AI Verification
    const verificationResult = await verificationService.verifyIssueResolution({
      issueId: createdIssueId,
      workOrderId: workOrder.id,
      afterImageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800',
    });

    expect(verificationResult.isVerified).toBe(true);
    expect(verificationResult.confidence).toBeGreaterThanOrEqual(0.85);

    // 9. Verify Issue Fingerprint Status is VERIFIED_RESOLVED
    const finalIssue = await issuesService.findOne(createdIssueId);
    expect(finalIssue.status).toBe('VERIFIED_RESOLVED');
  }, 35000);
});
