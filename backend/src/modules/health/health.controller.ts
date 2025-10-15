import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'stvol-garden-api',
      version: '1.0.0'
    };
  }

  @Get()
  getRoot() {
    return {
      message: '🌸 Stvol Garden API is running',
      docs: '/api/docs',
      health: '/api/health'
    };
  }
}