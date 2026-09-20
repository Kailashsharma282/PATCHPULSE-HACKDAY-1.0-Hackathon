import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  private startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  @Public()
  @Get()
  async getHealth() {
    let dbStatus = 'DISCONNECTED';
    try {
      await this.prisma.user.findFirst({ select: { id: true } });
      dbStatus = 'CONNECTED';
    } catch (e) {
      dbStatus = 'ERROR';
    }

    const aiMode = this.aiService.getMode();

    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      services: {
        api: { status: 'HEALTHY', version: '1.0.0' },
        database: { status: dbStatus, type: 'SQLite/PostgreSQL (Prisma ORM)' },
        cache: { status: 'ACTIVE', provider: 'In-Memory State Fallback (Redis-Ready)' },
        aiEngine: {
          status: 'OPERATIONAL',
          mode: aiMode === 'mock' ? 'MOCK_DETERMINISTIC_HIGH_PRECISION' : 'OPENAI_PROVIDER',
        },
        fileStorage: { status: 'READY', provider: 'Local Filesystem & Cloud Media' },
      },
      hackathon: {
        name: 'HACKDAY 1.0',
        theme: 'TECH FOR A BETTER TOMORROW',
        team: 'kailashsharma8',
        participant: 'Pochiraju Kailash Ram Markandeya Sharma',
        project: 'PATCHPULSE',
      },
    };
  }
}
