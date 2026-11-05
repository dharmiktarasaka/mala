import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness & Readiness probe for load balancers and container orchestrators' })
  @ApiResponse({ status: 200, description: 'Application is healthy and ready to serve traffic' })
  async check() {
    let dbStatus = 'connected';
    try {
      if (this.prisma.isOfflineMode) {
        dbStatus = 'in-memory-mode';
      } else {
        await this.prisma.$queryRaw`SELECT 1`;
      }
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }

    const memUsage = process.memoryUsage();

    return {
      status: 'ok',
      service: 'mala-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      memory: {
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}

