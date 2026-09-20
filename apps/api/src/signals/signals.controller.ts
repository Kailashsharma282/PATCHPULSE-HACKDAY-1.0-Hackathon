import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SignalsService, CreateSignalDto } from './signals.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Public()
  @Get('recent')
  async getRecent(@Query('limit') limit?: number) {
    const signals = await this.signalsService.getRecentSignals(limit ? Number(limit) : 30);
    return {
      success: true,
      data: signals,
    };
  }

  @Public()
  @Get('issue/:issueId')
  async getByIssue(@Param('issueId') issueId: string) {
    const signals = await this.signalsService.getSignalsByIssue(issueId);
    return {
      success: true,
      data: signals,
    };
  }

  @Public()
  @Post()
  async create(@Body() dto: CreateSignalDto) {
    const signal = await this.signalsService.createSignal(dto);
    return {
      success: true,
      data: signal,
    };
  }
}
