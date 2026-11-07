import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dns from 'dns';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Use public DNS resolvers on Windows to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in restricted environments
}

// Global process error handlers to prevent unexpected background exits
process.on('unhandledRejection', (reason: any) => {
  const msg = reason?.message || String(reason);
  console.warn(`[Process] Unhandled Rejection intercepted: ${msg}`);
});

process.on('uncaughtException', (err: any) => {
  console.warn(`[Process] Uncaught Exception intercepted: ${err.message}`);
});

async function bootstrap() {
  const logger = new Logger('MalaPlatform');
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown hooks for SIGTERM / SIGINT in containerized environments
  // app.enableShutdownHooks();

  // Trust reverse proxy (Nginx, Cloudflare, AWS ALB) for client IP detection
  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.set('trust proxy', 1);

  // Configurable dynamic CORS supporting credentials and any origin (including Vercel, localhost, mobile)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // If specific whitelist is set and not '*', enforce it
      if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
        const whitelist = process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
        if (whitelist.includes(origin)) {
          return callback(null, true);
        }
      }

      // Automatically reflect caller origin to allow credentials
      return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept, X-Requested-With, Origin',
    exposedHeaders: 'Content-Range, X-Content-Range',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global prefixes and pipes
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MALA - Spiritual Mala Counting & Transfer Platform API')
    .setDescription(
      'Enterprise-grade REST & WebSocket API specification for Digital Mala Counter, Banking-Style Double-Entry Ledger, Social Feed, Devotee Messaging and Admin Governance.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Mala Platform API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`=======================================================`);
  logger.log(`🕉️  MALA Backend is running on: http://localhost:${port}/api/v1`);
  logger.log(`📖  OpenAPI / Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}

bootstrap();

