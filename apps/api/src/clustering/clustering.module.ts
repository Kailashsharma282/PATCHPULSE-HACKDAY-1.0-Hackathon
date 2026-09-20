import { Global, Module } from '@nestjs/common';
import { ClusteringService } from './clustering.service';

@Global()
@Module({
  providers: [ClusteringService],
  exports: [ClusteringService],
})
export class ClusteringModule {}
