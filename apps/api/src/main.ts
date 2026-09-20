import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('PATCHPULSE-BOOTSTRAP');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`=======================================================`);
  logger.log(`🚀 PATCHPULSE — AI Civic Intelligence & Verification`);
  logger.log(`🏛️ HACKDAY 1.0 — TECH FOR A BETTER TOMORROW`);
  logger.log(`👤 Participant: Pochiraju Kailash Ram Markandeya Sharma`);
  logger.log(`👥 Team: kailashsharma8`);
  logger.log(`📡 Backend API live at: http://localhost:${port}/api`);
  logger.log(`💓 Health check at:     http://localhost:${port}/api/health`);
  logger.log(`🎯 Demo simulation at:  http://localhost:${port}/api/demo/state`);
  logger.log(`=======================================================`);
}

bootstrap();
