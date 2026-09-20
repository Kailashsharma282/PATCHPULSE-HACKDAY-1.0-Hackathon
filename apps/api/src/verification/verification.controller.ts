import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VerificationService, VerifyResolutionDto } from './verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('issues')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post(':id/verify')
  async verify(
    @Param('id') issueId: string,
    @Body() body: Omit<VerifyResolutionDto, 'issueId'>,
    @CurrentUser('id') actorId: string,
  ) {
    const result = await this.verificationService.verifyIssueResolution(
      {
        issueId,
        ...body,
      },
      actorId,
    );

    return {
      success: true,
      message: result.isVerified
        ? 'Resolution verified successfully via AI visual inspection'
        : 'Verification confidence threshold unmet. Issue reopened for review.',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post(':id/reopen')
  async reopen(
    @Param('id') issueId: string,
    @Body('reason') reason: string,
    @CurrentUser('id') actorId: string,
  ) {
    const updated = await this.verificationService.reopenIssue(issueId, reason, actorId);
    return {
      success: true,
      message: `Issue #${issueId} successfully reopened`,
      data: updated,
    };
  }
}
