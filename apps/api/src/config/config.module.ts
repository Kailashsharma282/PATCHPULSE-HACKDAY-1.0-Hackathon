import { Module } from '@nestjs/common';
import { AdminConfigService } from './config.service';
import { AdminConfigController } from './config.controller';

@Module({
  controllers: [AdminConfigController],
  providers: [AdminConfigService],
  exports: [AdminConfigService],
})
export class AdminConfigModule {}
