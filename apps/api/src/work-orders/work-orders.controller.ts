import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkOrdersService, CreateWorkOrderDto } from './work-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Public()
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    const result = await this.workOrdersService.findAll({ page, limit, status, priority });
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wo = await this.workOrdersService.findOne(id);
    return {
      success: true,
      data: wo,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post()
  async create(
    @Body() dto: CreateWorkOrderDto,
    @CurrentUser('id') actorId: string,
  ) {
    const wo = await this.workOrdersService.createWorkOrder(dto, actorId);
    return {
      success: true,
      message: `Work Order #${wo.id} successfully created`,
      data: wo,
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
    const updated = await this.workOrdersService.updateStatus(id, status, actorId);
    return {
      success: true,
      message: `Work Order #${id} status updated to ${status}`,
      data: updated,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('assignedToUserId') assignedToUserId: string,
    @CurrentUser('id') actorId: string,
  ) {
    const updated = await this.workOrdersService.assign(id, assignedToUserId, actorId);
    return {
      success: true,
      message: `Work Order #${id} assigned successfully`,
      data: updated,
    };
  }
}
