import { IssuesService } from '../src/issues/issues.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Workflow & State Machine Unit Tests', () => {
  let issuesService: IssuesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      issue: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };
    issuesService = new IssuesService(mockPrisma as any, {} as any, {} as any);
  });

  it('should allow valid transition from DETECTED to CORROBORATING', async () => {
    mockPrisma.issue.findUnique.mockResolvedValue({
      id: 'P-024',
      status: 'DETECTED',
    });
    mockPrisma.issue.update.mockResolvedValue({
      id: 'P-024',
      status: 'CORROBORATING',
    });

    const res = await issuesService.updateStatus('P-024', 'CORROBORATING', 'user-1');
    expect(res.status).toBe('CORROBORATING');
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it('should block invalid transition from VERIFIED_RESOLVED directly to IN_PROGRESS without reopening', async () => {
    mockPrisma.issue.findUnique.mockResolvedValue({
      id: 'P-024',
      status: 'VERIFIED_RESOLVED',
    });

    await expect(
      issuesService.updateStatus('P-024', 'IN_PROGRESS', 'user-1')
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if issue does not exist', async () => {
    mockPrisma.issue.findUnique.mockResolvedValue(null);

    await expect(
      issuesService.updateStatus('P-999', 'ASSIGNED', 'user-1')
    ).rejects.toThrow(NotFoundException);
  });
});
