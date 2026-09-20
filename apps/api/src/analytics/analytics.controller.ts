import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get('overview')
  async getOverview() {
    const data = await this.analyticsService.getOverview();
    return {
      success: true,
      data,
    };
  }

  @Public()
  @Get('trends')
  async getTrends() {
    const data = await this.analyticsService.getTrends();
    return {
      success: true,
      data,
    };
  }

  @Public()
  @Get('categories')
  async getCategories() {
    const data = await this.analyticsService.getCategoryDistribution();
    return {
      success: true,
      data,
    };
  }

  @Public()
  @Get('priorities')
  async getPriorities() {
    const data = await this.analyticsService.getPriorityDistribution();
    return {
      success: true,
      data,
    };
  }

  @Public()
  @Get('hotspots')
  async getHotspots() {
    const data = await this.analyticsService.getHotspots();
    return {
      success: true,
      data,
    };
  }
}
