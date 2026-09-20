import { Global, Module } from '@nestjs/common';
import { PriorityService } from './priority.service';

@Global()
@Module({
  providers: [PriorityService],
  exports: [PriorityService],
})
export class PriorityModule {}
