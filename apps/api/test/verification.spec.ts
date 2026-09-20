import { VerificationService } from '../src/verification/verification.service';
import { AiService } from '../src/ai/ai.service';

describe('VerificationService Unit Tests', () => {
  let verificationService: VerificationService;
  let aiService: AiService;
  let mockPrisma: any;

  beforeEach(() => {
    aiService = new AiService();
    mockPrisma = {
      issue: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      workOrder: {
        update: jest.fn(),
      },
      verification: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };
    verificationService = new VerificationService(mockPrisma as any, aiService);
  });

  it('should mark issue and work order VERIFIED_RESOLVED when confidence >= 85%', async () => {
    mockPrisma.issue.findUnique.mockResolvedValue({
      id: 'P-024',
      canonicalCategory: 'STREETLIGHT',
      reports: [{ mediaUrl: 'https://example.com/before.jpg' }],
      workOrders: [{ id: 'PX-0192' }],
    });

    mockPrisma.verification.create.mockResolvedValue({
      id: 'v-1',
      status: 'VERIFIED_RESOLVED',
      resolutionConfidence: 0.97,
    });

    const result = await verificationService.verifyIssueResolution(
      {
        issueId: 'P-024',
        workOrderId: 'PX-0192',
        afterImageUrl: 'https://example.com/after-fixed.jpg',
      },
      'operator-1'
    );

    expect(result.isVerified).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    expect(mockPrisma.issue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'P-024' },
        data: expect.objectContaining({ status: 'VERIFIED_RESOLVED' }),
      })
    );
  });

  it('should REOPEN issue when after-image verification fails confidence threshold', async () => {
    mockPrisma.issue.findUnique.mockResolvedValue({
      id: 'P-024',
      canonicalCategory: 'STREETLIGHT',
      reports: [{ mediaUrl: 'https://example.com/before.jpg' }],
      workOrders: [{ id: 'PX-0192' }],
    });

    mockPrisma.verification.create.mockResolvedValue({
      id: 'v-2',
      status: 'REOPENED_FOR_REVIEW',
      resolutionConfidence: 0.41,
    });

    const result = await verificationService.verifyIssueResolution(
      {
        issueId: 'P-024',
        workOrderId: 'PX-0192',
        afterImageUrl: 'https://example.com/fail.jpg',
      },
      'operator-1'
    );

    expect(result.isVerified).toBe(false);
    expect(mockPrisma.issue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'P-024' },
        data: expect.objectContaining({ status: 'REOPENED' }),
      })
    );
  });
});
