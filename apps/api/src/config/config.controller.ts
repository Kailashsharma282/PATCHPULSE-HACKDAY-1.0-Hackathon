import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin')
export class AdminConfigController {
  constructor(private readonly configService: AdminConfigService) {}

  @Public()
  @Get('config')
  async getConfig() {
    const config = await this.configService.getAllConfig();
    return {
      success: true,
      data: config,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('config')
  async updateConfig(
    @Body('key') key: string,
    @Body('value') value: any,
    @Body('description') description?: string,
  ) {
    const updated = await this.configService.updateConfig(key, value, description);
    return {
      success: true,
      message: `Configuration [${key}] updated successfully`,
      data: updated,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  async getUsers() {
    const users = await this.configService.getAllUsers();
    return {
      success: true,
      data: users,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: string,
  ) {
    const updated = await this.configService.updateUserRole(userId, role);
    return {
      success: true,
      message: `User role updated to ${role}`,
      data: updated,
    };
  }

  @Public()
  @Get('locations')
  async getLocations() {
    const locations = await this.configService.getAllLocations();
    return {
      success: true,
      data: locations,
    };
  }

  @Public()
  @Get('categories')
  async getCategories() {
    const categories = await this.configService.getAllCategories();
    return {
      success: true,
      data: categories,
    };
  }
}
