import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isOfflineMode = false;

  // In-memory data structures for offline / zero-database standalone mode
  private memoryUsers = new Map<string, any>();
  private memoryProfiles = new Map<string, any>();
  private memoryWallets = new Map<string, any>();
  private memoryLedgerAccounts = new Map<string, any>();
  private memoryTransactions = new Map<string, any>();
  private memoryEntries: any[] = [];
  private memoryStats = new Map<string, any>();
  private memorySessions: any[] = [];
  private memoryFriends: any[] = [];
  private memoryFriendRequests = new Map<string, any>();
  private memoryPosts = new Map<string, any>();
  private memoryLikes = new Map<string, any>();
  private memoryComments = new Map<string, any>();
  private memoryConversations = new Map<string, any>();
  private memoryMessages: any[] = [];
  private memoryNotifications: any[] = [];
  private memoryAchievements = new Map<string, any>();
  private memoryUserAchievements = new Map<string, any>();
  private memorySubscriptions = new Map<string, any>();
  private memoryAuditLogs: any[] = [];
  private memoryBlockedUsers: any[] = [];
  private dbFilePath = path.join(process.cwd(), 'data', 'standalone_db.json');

  public saveToDisk() {
    try {
      const dataDir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const snapshot = {
        users: Array.from(this.memoryUsers.entries()),
        profiles: Array.from(this.memoryProfiles.entries()),
        wallets: Array.from(this.memoryWallets.entries()),
        ledgerAccounts: Array.from(this.memoryLedgerAccounts.entries()),
        transactions: Array.from(this.memoryTransactions.entries()),
        stats: Array.from(this.memoryStats.entries()),
        posts: Array.from(this.memoryPosts.entries()),
        subscriptions: Array.from(this.memorySubscriptions.entries()),
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (e: any) {
      this.logger.warn(`Failed to persist standalone DB to disk: ${e.message}`);
    }
  }

  private loadFromDisk(): boolean {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const snapshot = JSON.parse(raw);
        if (snapshot.users) this.memoryUsers = new Map(snapshot.users);
        if (snapshot.profiles) this.memoryProfiles = new Map(snapshot.profiles);
        if (snapshot.wallets) this.memoryWallets = new Map(snapshot.wallets);
        if (snapshot.ledgerAccounts) this.memoryLedgerAccounts = new Map(snapshot.ledgerAccounts);
        if (snapshot.transactions) this.memoryTransactions = new Map(snapshot.transactions);
        if (snapshot.stats) this.memoryStats = new Map(snapshot.stats);
        if (snapshot.posts) this.memoryPosts = new Map(snapshot.posts);
        if (snapshot.subscriptions) this.memorySubscriptions = new Map(snapshot.subscriptions);
        this.logger.log(`📦 Loaded ${this.memoryUsers.size} devotee accounts from persistent local storage.`);
        return true;
      }
    } catch (e: any) {
      this.logger.warn(`Could not load standalone DB: ${e.message}`);
    }
    return false;
  }

  public async loadFromMongo(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) {
        return false;
      }
      const db = mongoose.connection.db;
      if (!db) return false;

      const collections = await db.listCollections().toArray();
      const collNames = new Set(collections.map((c) => c.name));

      // Load users
      if (collNames.has('users')) {
        const users = await db.collection('users').find({}).toArray();
        for (const u of users) {
          const docId = u.id || (u._id ? String(u._id) : null);
          if (docId) {
            this.memoryUsers.set(docId, { ...u, id: docId });
          }
        }
        this.logger.log(`📦 Loaded ${this.memoryUsers.size} devotee accounts from MongoDB Atlas.`);
      }

      // Load user profiles
      if (collNames.has('user_profiles')) {
        const profiles = await db.collection('user_profiles').find({}).toArray();
        for (const p of profiles) {
          const key = p.userId || p.id || String(p._id);
          this.memoryProfiles.set(key, { ...p, id: p.id || String(p._id) });
        }
      }

      // Load wallets
      if (collNames.has('wallets')) {
        const wallets = await db.collection('wallets').find({}).toArray();
        for (const w of wallets) {
          const docId = w.id || String(w._id);
          this.memoryWallets.set(docId, { ...w, id: docId });
        }
      }

      // Load ledger accounts
      if (collNames.has('ledger_accounts')) {
        const accounts = await db.collection('ledger_accounts').find({}).toArray();
        for (const acc of accounts) {
          const docId = acc.id || String(acc._id);
          this.memoryLedgerAccounts.set(docId, { ...acc, id: docId });
        }
      }

      // Load transactions
      if (collNames.has('ledger_transactions')) {
        const txs = await db.collection('ledger_transactions').find({}).toArray();
        for (const tx of txs) {
          const docId = tx.id || String(tx._id);
          this.memoryTransactions.set(docId, { ...tx, id: docId });
        }
      }

      // Load practice statistics
      if (collNames.has('practice_statistics')) {
        const stats = await db.collection('practice_statistics').find({}).toArray();
        for (const s of stats) {
          const key = s.userId || s.id || String(s._id);
          this.memoryStats.set(key, { ...s, id: s.id || String(s._id) });
        }
      }

      // Load counter practice sessions
      if (collNames.has('counter_sessions')) {
        this.memorySessions = await db.collection('counter_sessions').find({}).toArray();
      }

      // Load posts
      if (collNames.has('posts')) {
        const posts = await db.collection('posts').find({}).toArray();
        for (const p of posts) {
          const docId = p.id || String(p._id);
          this.memoryPosts.set(docId, { ...p, id: docId });
        }
      }

      // Load subscriptions
      if (collNames.has('subscriptions')) {
        const subs = await db.collection('subscriptions').find({}).toArray();
        for (const s of subs) {
          const docId = s.id || String(s._id);
          this.memorySubscriptions.set(docId, { ...s, id: docId });
        }
      }

      return true;
    } catch (err: any) {
      this.logger.warn(`Could not load records from MongoDB Atlas: ${err.message}`);
      return false;
    }
  }

  public async saveToMongo(collectionName: string, id: string, doc: any): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        this.logger.warn(`⚠️ [MongoDB Atlas] Database not ready (readyState=${mongoose.connection.readyState}). Buffering write [${collectionName}]: ${id}`);
        return false;
      }
      const db = mongoose.connection.db;
      const cleanDoc = { ...doc };
      delete cleanDoc._id;

      // Omit null/undefined values to prevent Mongo unique sparse index collisions (e.g. phone: null)
      const unsetFields: any = {};
      for (const k of Object.keys(cleanDoc)) {
        if (cleanDoc[k] === null || cleanDoc[k] === undefined) {
          delete cleanDoc[k];
          unsetFields[k] = '';
        }
      }

      const updateOp: any = { $set: cleanDoc };
      if (Object.keys(unsetFields).length > 0) {
        updateOp.$unset = unsetFields;
      }

      await db.collection(collectionName).updateOne(
        { id: id } as any,
        updateOp,
        { upsert: true }
      );
      this.logger.log(`💾 [MongoDB Atlas] Successfully persisted [${collectionName}] id: ${id}`);
      return true;
    } catch (err: any) {
      this.logger.error(`❌ Failed to persist to MongoDB [${collectionName}]: ${err.message}`);
      return false;
    }
  }

  public async deleteFromMongo(collectionName: string, id: string) {
    try {
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return;
      const db = mongoose.connection.db;
      await db.collection(collectionName).deleteOne({ id } as any);
      this.logger.log(`🗑️ [MongoDB Atlas] Deleted [${collectionName}] id: ${id}`);
    } catch (err: any) {
      this.logger.warn(`Failed to delete from MongoDB [${collectionName}]: ${err.message}`);
    }
  }

  public async syncAllPendingToMongo() {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return;
    const db = mongoose.connection.db;
    try {
      this.logger.log(`🔄 [MongoDB Atlas] Synchronizing memory records to MongoDB Atlas...`);
      for (const [id, user] of this.memoryUsers.entries()) {
        const clean = { ...user };
        delete clean._id;
        for (const k of Object.keys(clean)) {
          if (clean[k] === null || clean[k] === undefined) delete clean[k];
        }
        await db.collection('users').updateOne({ id: id } as any, { $set: clean }, { upsert: true });
      }
      for (const [userId, profile] of this.memoryProfiles.entries()) {
        const clean = { ...profile };
        delete clean._id;
        for (const k of Object.keys(clean)) {
          if (clean[k] === null || clean[k] === undefined) delete clean[k];
        }
        await db.collection('user_profiles').updateOne({ userId } as any, { $set: clean }, { upsert: true });
      }
      for (const [id, wallet] of this.memoryWallets.entries()) {
        const clean = { ...wallet };
        delete clean._id;
        for (const k of Object.keys(clean)) {
          if (clean[k] === null || clean[k] === undefined) delete clean[k];
        }
        await db.collection('wallets').updateOne({ id: id } as any, { $set: clean }, { upsert: true });
      }
      for (const [id, acc] of this.memoryLedgerAccounts.entries()) {
        const clean = { ...acc };
        delete clean._id;
        await db.collection('ledger_accounts').updateOne({ id: id } as any, { $set: clean }, { upsert: true });
      }
      for (const [id, tx] of this.memoryTransactions.entries()) {
        const clean = { ...tx };
        delete clean._id;
        await db.collection('ledger_transactions').updateOne({ id: id } as any, { $set: clean }, { upsert: true });
      }
      for (const [userId, stats] of this.memoryStats.entries()) {
        const clean = { ...stats };
        delete clean._id;
        await db.collection('practice_statistics').updateOne({ userId } as any, { $set: clean }, { upsert: true });
      }
      for (const [id, sub] of this.memorySubscriptions.entries()) {
        const clean = { ...sub };
        delete clean._id;
        await db.collection('subscriptions').updateOne({ id: id } as any, { $set: clean }, { upsert: true });
      }
      for (const [id, post] of this.memoryPosts.entries()) {
        const clean = { ...post };
        delete clean._id;
        await db.collection('posts').updateOne({ id: id } as any, { $set: clean }, { upsert: true });
      }
      this.logger.log(`🌟 [MongoDB Atlas] All memory records successfully synchronized to MongoDB Atlas!`);
    } catch (e: any) {
      this.logger.warn(`⚠️ [MongoDB Atlas] Sync error: ${e.message}`);
    }
  }

  constructor() {
    super({
      log: ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to authoritative PostgreSQL database server.');
    } catch (err: any) {
      this.isOfflineMode = true;
      this.logger.warn(`⚠️ PostgreSQL server offline (${err.message}). Activating MongoDB Atlas Cloud Persistence Mode.`);
      await this.seedInMemoryDatabase();
      this.attachInMemoryProxy();

      // Attempt to load and sync with MongoDB Atlas
      await this.loadFromMongo();
      await this.syncAllPendingToMongo();

      // Whenever MongoDB connects or reconnects, synchronize records
      mongoose.connection.on('connected', async () => {
        this.logger.log('🔄 MongoDB Atlas connected. Synchronizing records with memory cache...');
        await this.loadFromMongo();
        await this.syncAllPendingToMongo();
      });
    }
  }

  async onModuleDestroy() {
    if (!this.isOfflineMode) {
      await this.$disconnect();
    }
  }

  private async seedInMemoryDatabase() {
    // Attempt to load existing users and data from disk
    this.loadFromDisk();

    // Seed standard achievement definitions only
    const achs = [
      { id: 'ach-1', code: 'FIRST_MALA', name: 'First Step', description: 'Complete your first digital Mala count', iconName: 'flower-outline', targetValue: 1, category: 'PRACTICE' },
      { id: 'ach-2', code: 'MALA_108', name: 'Sacred 108', description: 'Count a complete traditional 108 bead Mala', iconName: 'sunny-outline', targetValue: 108, category: 'PRACTICE' },
      { id: 'ach-3', code: 'STREAK_7', name: '7-Day Devotion', description: 'Practice Mala continuously for 7 consecutive days', iconName: 'flame-outline', targetValue: 7, category: 'STREAK' },
      { id: 'ach-4', code: 'MALA_1008', name: 'Mahasadhak 1,008', description: 'Reach 1,008 total Mala repetitions', iconName: 'ribbon-outline', targetValue: 1008, category: 'PRACTICE' },
    ];
    for (const a of achs) this.memoryAchievements.set(a.id, a);

    // Completely empty - all fake users (user_a, user_b, user_c, admin) and fake posts removed.
  }

  private attachInMemoryProxy() {
    const self = this;

    // Helper to enrich user with profile, wallet, etc.
    const enrichUser = (u: any, include?: any) => {
      if (!u) return null;
      const copy = { ...u };
      if (include?.profile) copy.profile = self.memoryProfiles.get(u.id) || null;
      if (include?.wallet) {
        let w = Array.from(self.memoryWallets.values()).find((item) => item.userId === u.id);
        if (!w) {
          w = {
            id: `w-${u.id}`,
            userId: u.id,
            balance: 108,
            totalReceived: 0,
            totalSent: 0,
            totalEarned: 108,
            status: 'ACTIVE',
            createdAt: new Date(),
          };
          self.memoryWallets.set(w.id, w);
        }
        copy.wallet = { ...w };
      }
      if (include?.practiceStatistics) copy.practiceStatistics = self.memoryStats.get(u.id) || null;
      if (include?._count) {
        copy._count = {
          friends: self.memoryFriends.filter((f) => f.userId === u.id).length,
          posts: Array.from(self.memoryPosts.values()).filter((p) => p.userId === u.id).length,
        };
      }
      if (include?.subscriptions) {
        copy.subscriptions = Array.from(self.memorySubscriptions.values()).filter((s) => s.userId === u.id);
      }
      if (!copy.devoteeId) {
        if (/^\d{6,}$/.test(copy.id)) {
          copy.devoteeId = copy.id;
        } else {
          const hashNum = Math.abs(String(copy.id).split('').reduce((acc: number, c: string) => acc * 31 + c.charCodeAt(0), 0));
          copy.devoteeId = String((hashNum % 900000) + 100000);
        }
      }
      return copy;
    };

    // Override User Model
    (this as any).user = {
      findUnique: async ({ where, include }: any) => {
        let u = null;
        if (where.id) u = self.memoryUsers.get(where.id);
        if (!u && where.devoteeId) {
          u = Array.from(self.memoryUsers.values()).find(
            (x) => String(x.devoteeId) === String(where.devoteeId) || String(x.id) === String(where.devoteeId),
          );
        }
        if (!u && where.email) {
          const target = where.email.toLowerCase().trim();
          u = Array.from(self.memoryUsers.values()).find((x) => x.email?.toLowerCase() === target);
        }
        if (!u && where.username) {
          const target = where.username.toLowerCase().trim();
          u = Array.from(self.memoryUsers.values()).find(
            (x) => x.username?.toLowerCase() === target || String(x.devoteeId) === target,
          );
        }
        if (!u && where.phone) u = Array.from(self.memoryUsers.values()).find((x) => x.phone === where.phone);

        // Fallback to MongoDB Atlas if not yet loaded into memory
        if (!u && mongoose.connection.readyState === 1 && mongoose.connection.db) {
          try {
            const query: any = {};
            if (where.id) query.$or = [{ id: where.id }, { _id: where.id }, { devoteeId: where.id }];
            if (where.devoteeId) query.$or = [{ devoteeId: where.devoteeId }, { id: where.devoteeId }];
            if (where.email) query.email = where.email.toLowerCase().trim();
            if (where.username) query.username = where.username.toLowerCase().trim();
            if (where.phone) query.phone = where.phone;
            const dbDoc = await mongoose.connection.db.collection('users').findOne(query);
            if (dbDoc) {
              const docId = dbDoc.id || String(dbDoc._id);
              u = { ...dbDoc, id: docId };
              self.memoryUsers.set(docId, u);
            }
          } catch {}
        }

        return enrichUser(u, include);
      },
      findFirst: async ({ where, include }: any) => {
        const cleanTerm = (val: any) => (val ? String(val).replace(/^[#@]/, '').trim() : '');
        let found = null;
        const users = Array.from(self.memoryUsers.values());
        for (const u of users) {
          const uDevoteeId = cleanTerm(u.devoteeId || u.id);
          const uUsername = u.username ? u.username.toLowerCase().trim() : '';
          const uEmail = u.email ? u.email.toLowerCase().trim() : '';

          if (where.devoteeId && (uDevoteeId === cleanTerm(where.devoteeId) || cleanTerm(u.id) === cleanTerm(where.devoteeId))) { found = u; break; }
          if (where.email && uEmail === cleanTerm(where.email).toLowerCase()) { found = u; break; }
          if (where.username && (uUsername === cleanTerm(where.username).toLowerCase() || uDevoteeId === cleanTerm(where.username))) { found = u; break; }
          if (where.id && (cleanTerm(u.id) === cleanTerm(where.id) || uDevoteeId === cleanTerm(where.id))) { found = u; break; }
          if (where.OR) {
            for (const cond of where.OR) {
              if (cond.devoteeId && (uDevoteeId === cleanTerm(cond.devoteeId) || cleanTerm(u.id) === cleanTerm(cond.devoteeId))) { found = u; break; }
              if (cond.email && uEmail === cleanTerm(cond.email).toLowerCase()) { found = u; break; }
              if (cond.username && (uUsername === cleanTerm(cond.username).toLowerCase() || uDevoteeId === cleanTerm(cond.username))) { found = u; break; }
              if (cond.phone && u.phone === cleanTerm(cond.phone)) { found = u; break; }
              if (cond.id && (cleanTerm(u.id) === cleanTerm(cond.id) || uDevoteeId === cleanTerm(cond.id))) { found = u; break; }
            }
            if (found) break;
          }
        }

        // Direct MongoDB fallback lookup
        if (!found && mongoose.connection.readyState === 1 && mongoose.connection.db) {
          try {
            const orList: any[] = [];
            if (where.email) orList.push({ email: where.email.toLowerCase().trim() });
            if (where.username) orList.push({ username: where.username.toLowerCase().trim() }, { devoteeId: where.username.trim() });
            if (where.devoteeId) orList.push({ devoteeId: String(where.devoteeId) }, { id: String(where.devoteeId) });
            if (where.phone) orList.push({ phone: where.phone.trim() });
            if (where.id) orList.push({ id: where.id }, { devoteeId: String(where.id) });
            if (where.OR) {
              for (const cond of where.OR) {
                if (cond.email) orList.push({ email: cond.email.toLowerCase().trim() });
                if (cond.username) orList.push({ username: cond.username.toLowerCase().trim() }, { devoteeId: cond.username.trim() });
                if (cond.devoteeId) orList.push({ devoteeId: String(cond.devoteeId) }, { id: String(cond.devoteeId) });
                if (cond.phone) orList.push({ phone: cond.phone.trim() });
                if (cond.id) orList.push({ id: cond.id }, { devoteeId: String(cond.id) });
              }
            }
            if (orList.length > 0) {
              const dbDoc = await mongoose.connection.db.collection('users').findOne({ $or: orList });
              if (dbDoc) {
                const docId = dbDoc.id || String(dbDoc._id);
                found = { ...dbDoc, id: docId };
                self.memoryUsers.set(docId, found);
              }
            }
          } catch (e: any) {
            self.logger.warn(`Direct Mongo user lookup error: ${e.message}`);
          }
        }

        return enrichUser(found, include);
      },
      findMany: async ({ where, include }: any) => {
        let users = Array.from(self.memoryUsers.values());
        if (where?.id?.not) users = users.filter((u) => u.id !== where.id.not);
        if (where?.status) users = users.filter((u) => u.status === where.status);
        return users.map((u) => enrichUser(u, include));
      },
      count: async ({ where }: any) => {
        let users = Array.from(self.memoryUsers.values());
        if (where?.status) users = users.filter((u) => u.status === where.status);
        return users.length;
      },
      create: async ({ data }: any) => {
        const devoteeNum = data.devoteeId || data.id || String(Math.floor(100000 + Math.random() * 900000));
        const u = {
          id: data.id || devoteeNum,
          devoteeId: devoteeNum,
          createdAt: new Date(),
          ...data,
        };
        self.memoryUsers.set(u.id, u);
        self.saveToDisk();
        await self.saveToMongo('users', u.id, u);
        return u;
      },
      update: async ({ where, data }: any) => {
        const u = self.memoryUsers.get(where.id);
        if (u) {
          Object.assign(u, data);
          self.saveToDisk();
          await self.saveToMongo('users', u.id, u);
        }
        return u;
      },
    };

    // Override UserProfile
    (this as any).userProfile = {
      create: async ({ data }: any) => {
        const p = { id: `p-${Date.now()}`, ...data };
        self.memoryProfiles.set(data.userId, p);
        self.saveToDisk();
        await self.saveToMongo('user_profiles', p.id, p);
        return p;
      },
      upsert: async ({ where, create, update }: any) => {
        let p = self.memoryProfiles.get(where.userId);
        if (p) {
          Object.assign(p, update);
        } else {
          p = { id: `p-${Date.now()}`, ...create };
          self.memoryProfiles.set(where.userId, p);
        }
        self.saveToDisk();
        await self.saveToMongo('user_profiles', p.id, p);
        return p;
      },
      update: async ({ where, data }: any) => {
        const p = self.memoryProfiles.get(where.userId);
        if (p) {
          Object.assign(p, data);
          self.saveToDisk();
          await self.saveToMongo('user_profiles', p.id, p);
        }
        return p;
      },
    };

    // Override Wallet
    (this as any).wallet = {
      findUnique: async ({ where, include }: any) => {
        let w = null;
        if (where.userId) w = Array.from(self.memoryWallets.values()).find((x) => x.userId === where.userId);
        if (where.id) w = self.memoryWallets.get(where.id);
        if (!w && mongoose.connection.readyState === 1 && mongoose.connection.db) {
          try {
            const query: any = {};
            if (where.userId) query.userId = where.userId;
            if (where.id) query.$or = [{ id: where.id }, { _id: where.id }];
            const dbWallet = await mongoose.connection.db.collection('wallets').findOne(query);
            if (dbWallet) {
              const docId = dbWallet.id || String(dbWallet._id);
              w = { ...dbWallet, id: docId };
              self.memoryWallets.set(docId, w);
            }
          } catch {}
        }
        if (!w && where.userId) {
          w = {
            id: `w-${where.userId}`,
            userId: where.userId,
            balance: 108,
            totalReceived: 0,
            totalSent: 0,
            totalEarned: 108,
            status: 'ACTIVE',
            createdAt: new Date(),
          };
          self.memoryWallets.set(w.id, w);
          self.saveToDisk();
          await self.saveToMongo('wallets', w.id, w);
        }
        if (!w) return null;

        // Auto-seed starter 108 Mala if uninitialized
        if (w.balance === 0 && (!w.totalEarned || w.totalEarned === 0) && (!w.totalSent || w.totalSent === 0)) {
          w.balance = 108;
          w.totalEarned = 108;
          self.memoryWallets.set(w.id, w);
          self.saveToDisk();
          await self.saveToMongo('wallets', w.id, w);
        }

        const copy = { ...w };
        if (include?.user) {
          copy.user = enrichUser(self.memoryUsers.get(w.userId), include.user.include);
        }
        if (include?.ledgerAccounts) {
          copy.ledgerAccounts = Array.from(self.memoryLedgerAccounts.values()).filter((acc) => acc.walletId === w.id);
        }
        return copy;
      },
      create: async ({ data }: any) => {
        const w = { id: `w-${Date.now()}`, totalReceived: 0, totalSent: 0, totalEarned: 108, status: 'ACTIVE', balance: 108, ...data };
        self.memoryWallets.set(w.id, w);
        self.saveToDisk();
        await self.saveToMongo('wallets', w.id, w);
        return w;
      },
      update: async ({ where, data }: any) => {
        let w = where.id ? self.memoryWallets.get(where.id) : null;
        if (!w && where.userId) {
          w = Array.from(self.memoryWallets.values()).find((x) => x.userId === where.userId);
        }
        if (!w && mongoose.connection.readyState === 1 && mongoose.connection.db) {
          try {
            const query: any = {};
            if (where.userId) query.userId = where.userId;
            if (where.id) query.$or = [{ id: where.id }, { _id: where.id }];
            const dbWallet = await mongoose.connection.db.collection('wallets').findOne(query);
            if (dbWallet) {
              const docId = dbWallet.id || String(dbWallet._id);
              w = { ...dbWallet, id: docId };
              self.memoryWallets.set(docId, w);
            }
          } catch {}
        }
        if (!w) return null;

        if (typeof data.balance === 'number') {
          w.balance = data.balance;
        } else if (data.balance?.increment) {
          w.balance = (w.balance || 0) + data.balance.increment;
        } else if (data.balance?.decrement) {
          w.balance = Math.max(0, (w.balance || 0) - data.balance.decrement);
        }

        if (data.totalSent?.increment) {
          w.totalSent = (w.totalSent || 0) + data.totalSent.increment;
        } else if (typeof data.totalSent === 'number') {
          w.totalSent = data.totalSent;
        }

        if (data.totalReceived?.increment) {
          w.totalReceived = (w.totalReceived || 0) + data.totalReceived.increment;
        } else if (typeof data.totalReceived === 'number') {
          w.totalReceived = data.totalReceived;
        }

        if (data.totalEarned?.increment) {
          w.totalEarned = (w.totalEarned || 0) + data.totalEarned.increment;
        } else if (typeof data.totalEarned === 'number') {
          w.totalEarned = data.totalEarned;
        }

        self.saveToDisk();
        await self.saveToMongo('wallets', w.id, w);
        return { ...w };
      },
    };

    // Override LedgerAccount
    (this as any).ledgerAccount = {
      create: async ({ data }: any) => {
        const acc = { id: `acc-${Date.now()}`, balance: 0, ...data };
        self.memoryLedgerAccounts.set(acc.id, acc);
        await self.saveToMongo('ledger_accounts', acc.id, acc);
        return acc;
      },
      update: async ({ where, data }: any) => {
        const acc = self.memoryLedgerAccounts.get(where.id);
        if (acc) {
          Object.assign(acc, data);
          await self.saveToMongo('ledger_accounts', acc.id, acc);
        }
        return acc;
      },
    };

    // Override LedgerTransaction
    (this as any).ledgerTransaction = {
      findUnique: async ({ where }: any) => {
        let tx = null;
        if (where.id) tx = self.memoryTransactions.get(where.id);
        if (where.idempotencyKey) {
          tx = Array.from(self.memoryTransactions.values()).find((x) => x.idempotencyKey === where.idempotencyKey);
        }
        if (!tx) return null;
        const sWallet = self.memoryWallets.get(tx.sourceWalletId);
        const tWallet = self.memoryWallets.get(tx.targetWalletId);
        return {
          ...tx,
          sourceWallet: sWallet ? { ...sWallet, user: enrichUser(self.memoryUsers.get(sWallet.userId), { profile: true }) } : null,
          targetWallet: tWallet ? { ...tWallet, user: enrichUser(self.memoryUsers.get(tWallet.userId), { profile: true }) } : null,
          entries: self.memoryEntries.filter((e) => e.transactionId === tx.id),
        };
      },
      findMany: async () => {
        const list = Array.from(self.memoryTransactions.values()).map((tx) => {
          const sWallet = self.memoryWallets.get(tx.sourceWalletId);
          const tWallet = self.memoryWallets.get(tx.targetWalletId);
          return {
            ...tx,
            sourceWallet: sWallet ? { ...sWallet, user: enrichUser(self.memoryUsers.get(sWallet.userId), { profile: true }) } : null,
            targetWallet: tWallet ? { ...tWallet, user: enrichUser(self.memoryUsers.get(tWallet.userId), { profile: true }) } : null,
          };
        });
        return list;
      },
      count: async () => self.memoryTransactions.size,
      aggregate: async () => {
        const sum = Array.from(self.memoryTransactions.values()).reduce((acc, cur) => acc + (cur.amount || 0), 0);
        return { _sum: { amount: sum } };
      },
      create: async ({ data }: any) => {
        const tx = { id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`, createdAt: new Date(), ...data };
        self.memoryTransactions.set(tx.id, tx);
        await self.saveToMongo('ledger_transactions', tx.id, tx);
        return tx;
      },
      update: async ({ where, data }: any) => {
        const tx = self.memoryTransactions.get(where.id);
        if (tx) {
          Object.assign(tx, data);
          await self.saveToMongo('ledger_transactions', tx.id, tx);
        }
        const sWallet = self.memoryWallets.get(tx.sourceWalletId);
        const tWallet = self.memoryWallets.get(tx.targetWalletId);
        return {
          ...tx,
          sourceWallet: sWallet ? { ...sWallet, user: enrichUser(self.memoryUsers.get(sWallet.userId), { profile: true }) } : null,
          targetWallet: tWallet ? { ...tWallet, user: enrichUser(self.memoryUsers.get(tWallet.userId), { profile: true }) } : null,
        };
      },
    };

    // Override LedgerEntry
    (this as any).ledgerEntry = {
      create: async ({ data }: any) => {
        const e = { id: `entry-${Date.now()}`, createdAt: new Date(), ...data };
        self.memoryEntries.push(e);
        await self.saveToMongo('ledger_entries', e.id, e);
        return e;
      },
    };

    // Override PracticeStatistics
    (this as any).practiceStatistics = {
      findUnique: async ({ where }: any) => self.memoryStats.get(where.userId) || null,
      create: async ({ data }: any) => {
        const s = { id: `s-${Date.now()}`, ...data };
        self.memoryStats.set(data.userId, s);
        await self.saveToMongo('practice_statistics', s.id, s);
        return s;
      },
      upsert: async ({ where, create, update }: any) => {
        let s = self.memoryStats.get(where.userId);
        if (s) {
          if (update.currentDailyCount !== undefined) s.currentDailyCount = update.currentDailyCount;
          if (update.lifetimeCount !== undefined) s.lifetimeCount = update.lifetimeCount;
          if (update.currentStreakDays !== undefined) s.currentStreakDays = update.currentStreakDays;
          if (update.longestStreakDays !== undefined) s.longestStreakDays = update.longestStreakDays;
          if (update.totalSessions?.increment) s.totalSessions += 1;
        } else {
          s = { id: `s-${Date.now()}`, ...create };
          self.memoryStats.set(where.userId, s);
        }
        await self.saveToMongo('practice_statistics', s.id, s);
        return s;
      },
      aggregate: async () => {
        const list = Array.from(self.memoryStats.values());
        return {
          _sum: {
            lifetimeCount: list.reduce((a, b) => a + (b.lifetimeCount || 0), 0),
            currentDailyCount: list.reduce((a, b) => a + (b.currentDailyCount || 0), 0),
            totalSessions: list.reduce((a, b) => a + (b.totalSessions || 0), 0),
          },
        };
      },
    };

    // Override MalaPracticeSession
    (this as any).malaPracticeSession = {
      create: async ({ data }: any) => {
        const s = { id: `sess-${Date.now()}`, ...data };
        self.memorySessions.push(s);
        await self.saveToMongo('counter_sessions', s.id, s);
        return s;
      },
      findMany: async ({ where }: any) => self.memorySessions.filter((s) => s.userId === where.userId),
    };

    // Override Friends
    (this as any).friend = {
      findMany: async ({ where }: any) => {
        return self.memoryFriends
          .filter((f) => f.userId === where.userId)
          .map((f) => ({
            ...f,
            friend: enrichUser(self.memoryUsers.get(f.friendId), { profile: true, practiceStatistics: true }),
          }));
      },
      findUnique: async () => null,
      upsert: async ({ create }: any) => {
        self.memoryFriends.push(create);
        await self.saveToMongo('friends', `${create.userId}_${create.friendId}`, create);
        return create;
      },
      deleteMany: async ({ where }: any) => {
        self.memoryFriends = self.memoryFriends.filter(
          (f) => !(f.userId === where.userId || f.friendId === where.friendId),
        );
        return { count: 1 };
      },
    };

    // Override FriendRequest
    (this as any).friendRequest = {
      findMany: async ({ where }: any) => {
        const reqs = Array.from(self.memoryFriendRequests.values());
        if (where?.receiverId) {
          return reqs.filter((r) => r.receiverId === where.receiverId && r.status === where.status)
            .map((r) => ({ ...r, sender: enrichUser(self.memoryUsers.get(r.senderId), { profile: true }) }));
        }
        if (where?.senderId) {
          return reqs.filter((r) => r.senderId === where.senderId && r.status === where.status)
            .map((r) => ({ ...r, receiver: enrichUser(self.memoryUsers.get(r.receiverId), { profile: true }) }));
        }
        return reqs;
      },
      findFirst: async () => null,
      findUnique: async ({ where }: any) => self.memoryFriendRequests.get(where.id) || null,
      upsert: async ({ create }: any) => {
        const req = { id: `req-${Date.now()}`, ...create };
        self.memoryFriendRequests.set(req.id, req);
        await self.saveToMongo('friend_requests', req.id, req);
        return req;
      },
      update: async ({ where, data }: any) => {
        const r = self.memoryFriendRequests.get(where.id);
        if (r) {
          Object.assign(r, data);
          await self.saveToMongo('friend_requests', r.id, r);
        }
        return r;
      },
      delete: async ({ where }: any) => {
        self.memoryFriendRequests.delete(where.id);
        await self.deleteFromMongo('friend_requests', where.id);
        return { id: where.id };
      },
      deleteMany: async () => ({ count: 1 }),
    };

    // Override Posts
    (this as any).post = {
      findMany: async () => {
        return Array.from(self.memoryPosts.values()).map((p) => ({
          ...p,
          user: enrichUser(self.memoryUsers.get(p.userId), { profile: true }),
          media: [],
          likes: [],
          comments: [],
        }));
      },
      findUnique: async ({ where }: any) => self.memoryPosts.get(where.id) || null,
      count: async () => self.memoryPosts.size,
      create: async ({ data }: any) => {
        const p = { id: `post-${Date.now()}`, likesCount: 0, commentsCount: 0, createdAt: new Date(), ...data };
        self.memoryPosts.set(p.id, p);
        await self.saveToMongo('posts', p.id, p);
        return {
          ...p,
          user: enrichUser(self.memoryUsers.get(p.userId), { profile: true }),
          media: [],
        };
      },
      update: async ({ where, data }: any) => {
        const p = self.memoryPosts.get(where.id);
        if (p) {
          if (data.likesCount?.increment) p.likesCount += 1;
          if (data.likesCount?.decrement) p.likesCount = Math.max(0, p.likesCount - 1);
          if (data.commentsCount?.increment) p.commentsCount += 1;
          await self.saveToMongo('posts', p.id, p);
        }
        return p;
      },
      delete: async ({ where }: any) => {
        self.memoryPosts.delete(where.id);
        await self.deleteFromMongo('posts', where.id);
        return { id: where.id };
      },
    };

    // Override Likes
    (this as any).like = {
      findUnique: async () => null,
      create: async ({ data }: any) => {
        const l = { id: `like-${Date.now()}`, ...data };
        self.memoryLikes.set(l.id, l);
        await self.saveToMongo('likes', l.id, l);
        return l;
      },
      delete: async () => ({ count: 1 }),
    };

    // Override Comments
    (this as any).comment = {
      create: async ({ data }: any) => {
        const c = { id: `c-${Date.now()}`, createdAt: new Date(), ...data };
        self.memoryComments.set(c.id, c);
        await self.saveToMongo('comments', c.id, c);
        return {
          ...c,
          user: enrichUser(self.memoryUsers.get(c.userId), { profile: true }),
        };
      },
      findMany: async () => [],
    };

    // Override Conversations & Messages
    (this as any).conversation = {
      findMany: async () => [],
      findUnique: async ({ where }: any) => {
        const key = `${where.participantOneId_participantTwoId?.participantOneId}-${where.participantOneId_participantTwoId?.participantTwoId}`;
        return self.memoryConversations.get(key) || null;
      },
      create: async ({ data }: any) => {
        const key = `${data.participantOneId}-${data.participantTwoId}`;
        const c = { id: `conv-${Date.now()}`, ...data };
        self.memoryConversations.set(key, c);
        self.memoryConversations.set(c.id, c);
        await self.saveToMongo('conversations', c.id, c);
        return c;
      },
      update: async () => ({}),
    };

    (this as any).message = {
      findMany: async () => [],
      create: async ({ data }: any) => {
        const m = { id: `msg-${Date.now()}`, createdAt: new Date(), ...data };
        self.memoryMessages.push(m);
        await self.saveToMongo('messages', m.id, m);
        return { ...m, sender: enrichUser(self.memoryUsers.get(m.senderId), { profile: true }) };
      },
      count: async () => 0,
      updateMany: async () => ({ count: 1 }),
    };

    // Override Notifications
    (this as any).notification = {
      findMany: async ({ where }: any) => self.memoryNotifications.filter((n) => n.userId === where.userId),
      count: async () => 0,
      create: async ({ data }: any) => {
        const n = { id: `notif-${Date.now()}`, createdAt: new Date(), isRead: false, ...data };
        self.memoryNotifications.push(n);
        await self.saveToMongo('notifications', n.id, n);
        return n;
      },
      updateMany: async () => ({ count: 1 }),
    };

    // Override Achievements
    (this as any).achievement = {
      count: async () => self.memoryAchievements.size,
      findMany: async () => Array.from(self.memoryAchievements.values()),
      findUnique: async ({ where }: any) => Array.from(self.memoryAchievements.values()).find((a) => a.code === where.code),
      upsert: async () => ({}),
    };

    (this as any).userAchievement = {
      findMany: async () => [],
      upsert: async () => ({}),
    };

    // Override Subscriptions
    (this as any).subscription = {
      findFirst: async ({ where }: any) => Array.from(self.memorySubscriptions.values()).find((s) => s.userId === where.userId) || null,
      create: async ({ data }: any) => {
        const s = { id: `sub-${Date.now()}`, plan: 'FREE', status: 'ACTIVE', ...data };
        self.memorySubscriptions.set(s.id, s);
        await self.saveToMongo('subscriptions', s.id, s);
        return s;
      },
      count: async () => 1,
    };

    // Override Blocked User
    (this as any).blockedUser = {
      findFirst: async () => null,
      upsert: async () => ({}),
      deleteMany: async () => ({ count: 1 }),
    };

    // Override Audit Log
    (this as any).auditLog = {
      create: async ({ data }: any) => {
        const log = { id: `audit-${Date.now()}`, createdAt: new Date(), ...data };
        self.memoryAuditLogs.push(log);
        return log;
      },
      findMany: async () => self.memoryAuditLogs,
    };

    // Override $transaction
    (this as any).$transaction = async (cbOrArray: any) => {
      if (typeof cbOrArray === 'function') {
        return cbOrArray(self);
      }
      if (Array.isArray(cbOrArray)) {
        return Promise.all(cbOrArray);
      }
      return cbOrArray;
    };
  }
}
