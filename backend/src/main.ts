import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedDemoData } from './seeds/demo-seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Telegram Mini App
  app.enableCors({
    origin: [
      'https://telegram.org',
      'https://web.telegram.org',
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000'  // Local development
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // API prefix
  app.setGlobalPrefix('api');

  // Seed demo data for in-memory database
  try {
    const dataSource = app.get(DataSource);
    await seedDemoData(dataSource);
  } catch (error) {
    console.log('⚠️ Demo seeding skipped:', error.message);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🌸 Stvol Garden API is running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`🔗 API: http://localhost:${port}/api`);
  console.log(`❤️ Health: http://localhost:${port}/api/health`);
}

bootstrap();