import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Public() // Citizens can submit reports with or without auth (anonymity support - Section 89)
  @Post()
  async createReport(
    @Body() dto: CreateReportDto,
    @CurrentUser('id') userId?: string,
  ) {
    const result = await this.reportsService.createReport(userId, dto);
    return {
      success: true,
      message: result.isClustered
        ? 'Report analyzed and clustered with existing incident'
        : 'New issue fingerprint created from report',
      data: result,
    };
  }

  @Public()
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const result = await this.reportsService.findAll({ page, limit, status, userId });
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const report = await this.reportsService.findOne(id);
    return {
      success: true,
      data: report,
    };
  }
}
