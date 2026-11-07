import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Connection } from 'mongoose';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private connection: Connection | null = null;
  public isConnected = false;
  public connectionUri = '';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rawUri =
      this.configService.get<string>('MONGODB_URI') ||
      (this.configService.get<string>('DATABASE_URL')?.startsWith('mongodb')
        ? this.configService.get<string>('DATABASE_URL')
        : null) ||
      'mongodb+srv://dharmiktarasaka_db_user:18yfKRhHogmKHJtu@cluster0.iul7e85.mongodb.net/mala_db?retryWrites=true&w=majority';

    if (!rawUri) {
      this.logger.log('ℹ️ MONGODB_URI not configured. MongoDB integration is ready on-demand.');
      return;
    }

    this.connectionUri = rawUri;

    // Prevent unhandled error events from crashing Node.js process
    mongoose.connection.on('error', (err) => {
      this.logger.warn(`⚠️ MongoDB connection event: ${err.message}`);
    });

    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.logger.log('✅ MongoDB connection established successfully.');
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.logger.warn('⚠️ MongoDB disconnected.');
    });

    try {
      this.logger.log(`🔄 Connecting to MongoDB at ${this.maskUri(rawUri)}...`);

      const conn = await mongoose.connect(rawUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      this.connection = conn.connection;
      this.isConnected = this.connection.readyState === 1;

      this.logger.log(`✅ Connected to MongoDB database: [${this.connection.name || 'mala_db'}]`);
    } catch (err: any) {
      this.isConnected = false;
      try {
        await mongoose.disconnect();
      } catch {}
      this.logger.warn(
        `⚠️ Could not connect to MongoDB server (${err.message}). Application running with in-memory / relational fallback.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.connection && this.isConnected) {
      await mongoose.disconnect();
      this.logger.log('MongoDB connection closed.');
    }
  }

  getConnection(): Connection | null {
    return this.connection;
  }

  async ping(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    if (!this.connection || this.connection.readyState !== 1) {
      return { ok: false, error: 'MongoDB is not connected' };
    }

    try {
      const start = Date.now();
      await this.connection.db?.admin().ping();
      const latencyMs = Date.now() - start;
      return { ok: true, latencyMs };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }

  private maskUri(uri: string): string {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  }
}

