import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import mongoose from 'mongoose';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness & Readiness probe for load balancers and container orchestrators' })
  @ApiResponse({ status: 200, description: 'Application is healthy and ready to serve traffic' })
  async check() {
    let relationalDbStatus = 'connected';
    try {
      if (this.prisma.isOfflineMode) {
        relationalDbStatus = 'in-memory-mode';
      } else {
        await this.prisma.$queryRaw`SELECT 1`;
      }
    } catch (e: any) {
      relationalDbStatus = `error: ${e.message}`;
    }

    // Check MongoDB connection status
    let mongoStatus = 'disconnected';
    const state = mongoose.connection.readyState;
    if (state === 1) {
      mongoStatus = 'connected';
    } else if (state === 2) {
      mongoStatus = 'connecting';
    } else if (process.env.MONGODB_URI) {
      mongoStatus = 'configured_offline';
    } else {
      mongoStatus = 'ready_on_demand';
    }

    const memUsage = process.memoryUsage();

    return {
      status: 'ok',
      service: 'mala-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      databases: {
        primary: relationalDbStatus,
        mongodb: {
          status: mongoStatus,
          databaseName: mongoose.connection.name || 'mala_db',
          host: mongoose.connection.host || 'localhost',
        },
      },
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
