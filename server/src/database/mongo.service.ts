import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Connection } from 'mongoose';

// Direct replica set connection (bypasses SRV DNS lookup issues, connects directly to all 3 Atlas shards)
const DIRECT_REPLICA_URI =
  'mongodb://dharmiktarasaka_db_user:18yfKRhHogmKHJtu@ac-3apjusm-shard-00-00.iul7e85.mongodb.net:27017,ac-3apjusm-shard-00-01.iul7e85.mongodb.net:27017,ac-3apjusm-shard-00-02.iul7e85.mongodb.net:27017/mala_db?ssl=true&replicaSet=atlas-9r4j7f-shard-0&authSource=admin&retryWrites=true&w=majority';

// Standard SRV connection fallback
const SRV_FALLBACK_URI =
  'mongodb+srv://dharmiktarasaka_db_user:18yfKRhHogmKHJtu@cluster0.iul7e85.mongodb.net/mala_db?retryWrites=true&w=majority';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private connection: Connection | null = null;
  public isConnected = false;
  public connectionUri = '';
  private reconnectInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Listen for global mongoose connection events
    mongoose.connection.on('error', (err) => {
      this.logger.warn(`⚠️ MongoDB connection error: ${err.message}`);
      this.isConnected = false;
    });

    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.logger.log('✅ MongoDB connection established successfully.');
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.logger.warn('⚠️ MongoDB disconnected.');
    });

    // Initial connection attempt
    await this.connectWithFallback();

    // Auto-reconnect routine: check every 10 seconds and reconnect if dropped
    this.reconnectInterval = setInterval(async () => {
      if (!this.isConnected && !this.isConnecting && mongoose.connection.readyState !== 1) {
        this.logger.log('🔄 MongoDB disconnected. Attempting automatic reconnection...');
        await this.connectWithFallback();
      }
    }, 10000);
  }

  async onModuleDestroy() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    if (this.connection && this.isConnected) {
      await mongoose.disconnect();
      this.logger.log('MongoDB connection closed.');
    }
  }

  public async connectWithFallback(): Promise<boolean> {
    if (this.isConnecting || mongoose.connection.readyState === 1) {
      return mongoose.connection.readyState === 1;
    }

    this.isConnecting = true;

    const envUri =
      this.configService.get<string>('MONGODB_URI') ||
      (this.configService.get<string>('DATABASE_URL')?.startsWith('mongodb')
        ? this.configService.get<string>('DATABASE_URL')
        : null);

    // List of candidate URIs in order of preference:
    // 1. Explicit environment URI (if provided)
    // 2. Direct replica set URI (proven reliable, no SRV DNS dependency)
    // 3. SRV URI fallback
    const candidateUris: { uri: string; label: string }[] = [];

    if (envUri) {
      candidateUris.push({ uri: envUri, label: 'ENV_CONFIGURED' });
    }
    // Always include direct replica set URI
    candidateUris.push({ uri: DIRECT_REPLICA_URI, label: 'DIRECT_REPLICA_SET' });
    // Fallback SRV URI
    candidateUris.push({ uri: SRV_FALLBACK_URI, label: 'SRV_FALLBACK' });

    for (const { uri, label } of candidateUris) {
      try {
        this.logger.log(`🔄 Attempting MongoDB connection via [${label}]...`);

        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 20000,
          connectTimeoutMS: 20000,
          socketTimeoutMS: 45000,
          maxPoolSize: 20,
          minPoolSize: 2,
        });

        this.connection = conn.connection;
        this.isConnected = this.connection.readyState === 1;
        this.connectionUri = uri;

        this.logger.log(
          `✅ Successfully connected to MongoDB Atlas [${label}]! Database: [${this.connection.name || 'mala_db'}]`,
        );
        this.isConnecting = false;
        return true;
      } catch (err: any) {
        this.logger.warn(`⚠️ Connection via [${label}] failed: ${err.message}`);
        try {
          await mongoose.disconnect();
        } catch {}
      }
    }

    this.isConnecting = false;
    this.isConnected = false;
    this.logger.warn(
      '⚠️ All MongoDB connection attempts exhausted. Application running with in-memory persistence until next reconnect.',
    );
    return false;
  }

  public async ensureConnected(): Promise<boolean> {
    if (mongoose.connection.readyState === 1) return true;
    return await this.connectWithFallback();
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
