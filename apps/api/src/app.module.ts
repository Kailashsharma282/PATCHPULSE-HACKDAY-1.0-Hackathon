import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { ClusteringModule } from './clustering/clustering.module';
import { PriorityModule } from './priority/priority.module';
import { ReportsModule } from './reports/reports.module';
import { SignalsModule } from './signals/signals.module';
import { IssuesModule } from './issues/issues.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { VerificationModule } from './verification/verification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { DemoModule } from './demo/demo.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { HttpExceptionFilter } from './common/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AiModule,
    ClusteringModule,
    PriorityModule,
    ReportsModule,
    SignalsModule,
    IssuesModule,
    WorkOrdersModule,
    VerificationModule,
    AnalyticsModule,
    NotificationsModule,
    AdminConfigModule,
    HealthModule,
    DemoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
