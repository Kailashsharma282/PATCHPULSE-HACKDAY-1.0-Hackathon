import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Public()
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('priorityBand') priorityBand?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.issuesService.findAll({
      page,
      limit,
      search,
      category,
      priorityBand,
      status,
      sortBy,
      sortOrder,
    });
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const issue = await this.issuesService.findOne(id);
    return {
      success: true,
      data: issue,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('id') actorId: string,
  ) {
    const updated = await this.issuesService.updateStatus(id, status, actorId);
    return {
      success: true,
      message: `Issue status updated to ${status}`,
      data: updated,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post(':id/prioritize')
  async prioritize(@Param('id') id: string) {
    const result = await this.issuesService.recalculatePriority(id);
    return {
      success: true,
      message: 'Priority recalculated and updated successfully',
      data: result,
    };
  }
}
