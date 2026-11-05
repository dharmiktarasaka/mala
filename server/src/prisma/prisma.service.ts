import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
      this.logger.warn(`⚠️ PostgreSQL server offline (${err.message}). Activating Standalone In-Memory Devotee Ledger Mode.`);
      await this.seedInMemoryDatabase();
      this.attachInMemoryProxy();
    }
  }

  async onModuleDestroy() {
    if (!this.isOfflineMode) {
      await this.$disconnect();
    }
  }

  private async seedInMemoryDatabase() {
    const passwordHash = await bcrypt.hash('Password@123', 10);
    const adminPasswordHash = await bcrypt.hash('AdminPass@108', 10);

    // 1. Achievements
    const achs = [
      { id: 'ach-1', code: 'FIRST_MALA', name: 'First Step', description: 'Complete your first digital Mala count', iconName: 'flower-outline', targetValue: 1, category: 'PRACTICE' },
      { id: 'ach-2', code: 'MALA_108', name: 'Sacred 108', description: 'Count a complete traditional 108 bead Mala', iconName: 'sunny-outline', targetValue: 108, category: 'PRACTICE' },
      { id: 'ach-3', code: 'STREAK_7', name: '7-Day Devotion', description: 'Practice Mala continuously for 7 consecutive days', iconName: 'flame-outline', targetValue: 7, category: 'STREAK' },
      { id: 'ach-4', code: 'MALA_1008', name: 'Mahasadhak 1,008', description: 'Reach 1,008 total Mala repetitions', iconName: 'ribbon-outline', targetValue: 1008, category: 'PRACTICE' },
    ];
    for (const a of achs) this.memoryAchievements.set(a.id, a);

    // 2. User A (Arjun - 100 Mala)
    const userA = {
      id: 'user-a-id',
      username: 'user_a',
      email: 'user_a@mala.app',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    this.memoryUsers.set(userA.id, userA);
    this.memoryProfiles.set(userA.id, {
      id: 'p-a',
      userId: userA.id,
      displayName: 'Arjun Devotee',
      bio: 'Chanting Om Namah Shivaya daily. Seeking inner peace.',
      isPrivate: false,
      showMalaCount: true,
      showWalletBalance: false,
    });
    this.memoryWallets.set('w-a', {
      id: 'w-a',
      userId: userA.id,
      balance: 100,
      totalEarned: 100,
      totalReceived: 0,
      totalSent: 0,
      status: 'ACTIVE',
    });
    this.memoryLedgerAccounts.set('acc-a', {
      id: 'acc-a',
      walletId: 'w-a',
      accountType: 'USER_AVAILABLE',
      currency: 'MALA',
      balance: 100,
    });
    this.memoryStats.set(userA.id, {
      id: 's-a',
      userId: userA.id,
      currentDailyCount: 54,
      lifetimeCount: 1080,
      currentStreakDays: 12,
      longestStreakDays: 21,
      totalSessions: 10,
    });

    // 3. User B (Bhakti - 50 Mala)
    const userB = {
      id: 'user-b-id',
      username: 'user_b',
      email: 'user_b@mala.app',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    this.memoryUsers.set(userB.id, userB);
    this.memoryProfiles.set(userB.id, {
      id: 'p-b',
      userId: userB.id,
      displayName: 'Bhakti Seeker',
      bio: 'Hare Krishna! Practicing mindful japa meditation.',
      isPrivate: false,
      showMalaCount: true,
      showWalletBalance: false,
    });
    this.memoryWallets.set('w-b', {
      id: 'w-b',
      userId: userB.id,
      balance: 50,
      totalEarned: 50,
      totalReceived: 0,
      totalSent: 0,
      status: 'ACTIVE',
    });
    this.memoryLedgerAccounts.set('acc-b', {
      id: 'acc-b',
      walletId: 'w-b',
      accountType: 'USER_AVAILABLE',
      currency: 'MALA',
      balance: 50,
    });
    this.memoryStats.set(userB.id, {
      id: 's-b',
      userId: userB.id,
      currentDailyCount: 108,
      lifetimeCount: 2160,
      currentStreakDays: 18,
      longestStreakDays: 30,
      totalSessions: 20,
    });

    // 4. User C (Chetan - 0 Mala)
    const userC = {
      id: 'user-c-id',
      username: 'user_c',
      email: 'user_c@mala.app',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    this.memoryUsers.set(userC.id, userC);
    this.memoryProfiles.set(userC.id, {
      id: 'p-c',
      userId: userC.id,
      displayName: 'Chetan Traveler',
      bio: 'Beginning my spiritual journey with digital mala.',
      isPrivate: false,
      showMalaCount: true,
      showWalletBalance: false,
    });
    this.memoryWallets.set('w-c', {
      id: 'w-c',
      userId: userC.id,
      balance: 0,
      totalEarned: 0,
      totalReceived: 0,
      totalSent: 0,
      status: 'ACTIVE',
    });
    this.memoryLedgerAccounts.set('acc-c', {
      id: 'acc-c',
      walletId: 'w-c',
      accountType: 'USER_AVAILABLE',
      currency: 'MALA',
      balance: 0,
    });
    this.memoryStats.set(userC.id, {
      id: 's-c',
      userId: userC.id,
      currentDailyCount: 0,
      lifetimeCount: 27,
      currentStreakDays: 2,
      longestStreakDays: 5,
      totalSessions: 1,
    });

    // 5. Admin Devotee
    const admin = {
      id: 'admin-id',
      username: 'admin_devotee',
      email: 'admin@mala.app',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    this.memoryUsers.set(admin.id, admin);
    this.memoryProfiles.set(admin.id, {
      id: 'p-admin',
      userId: admin.id,
      displayName: 'Mala Platform Admin',
      bio: 'Platform Guardian and Community Moderator',
    });
    this.memoryWallets.set('w-admin', {
      id: 'w-admin',
      userId: admin.id,
      balance: 100000,
      status: 'ACTIVE',
    });
    this.memoryStats.set(admin.id, {
      id: 's-admin',
      userId: admin.id,
      currentDailyCount: 108,
      lifetimeCount: 10800,
      currentStreakDays: 100,
      longestStreakDays: 100,
    });

    // Initial Community Posts
    this.memoryPosts.set('post-1', {
      id: 'post-1',
      userId: userA.id,
      content: 'Morning 108 Gayatri Mantra completed with deep focus and calm. Wishing all devotees a blessed day! 🙏🕉️',
      category: 'PRACTICE',
      visibility: 'PUBLIC',
      likesCount: 5,
      commentsCount: 1,
      createdAt: new Date(),
    });
  }

  private attachInMemoryProxy() {
    const self = this;

    // Helper to enrich user with profile, wallet, etc.
    const enrichUser = (u: any, include?: any) => {
      if (!u) return null;
      const copy = { ...u };
      if (include?.profile) copy.profile = self.memoryProfiles.get(u.id) || null;
      if (include?.wallet) {
        const w = Array.from(self.memoryWallets.values()).find((item) => item.userId === u.id);
        copy.wallet = w ? { ...w } : null;
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
      return copy;
    };

    // Override User Model
    (this as any).user = {
      findUnique: async ({ where, include }: any) => {
        let u = null;
        if (where.id) u = self.memoryUsers.get(where.id);
        if (where.username) u = Array.from(self.memoryUsers.values()).find((x) => x.username === where.username);
        if (where.phone) u = Array.from(self.memoryUsers.values()).find((x) => x.phone === where.phone);
        return enrichUser(u, include);
      },
      findFirst: async ({ where, include }: any) => {
        const users = Array.from(self.memoryUsers.values());
        for (const u of users) {
          if (where.username && u.username === where.username) return enrichUser(u, include);
          if (where.id && u.id === where.id) return enrichUser(u, include);
          if (where.OR) {
            for (const cond of where.OR) {
              if (cond.username && u.username === cond.username) return enrichUser(u, include);
              if (cond.email && u.email === cond.email) return enrichUser(u, include);
              if (cond.phone && u.phone === cond.phone) return enrichUser(u, include);
              if (cond.id && u.id === cond.id) return enrichUser(u, include);
            }
          }
        }
        return null;
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
        const u = { id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`, createdAt: new Date(), ...data };
        self.memoryUsers.set(u.id, u);
        return u;
      },
      update: async ({ where, data }: any) => {
        const u = self.memoryUsers.get(where.id);
        if (u) Object.assign(u, data);
        return u;
      },
    };

    // Override UserProfile
    (this as any).userProfile = {
      create: async ({ data }: any) => {
        const p = { id: `p-${Date.now()}`, ...data };
        self.memoryProfiles.set(data.userId, p);
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
        return p;
      },
      update: async ({ where, data }: any) => {
        const p = self.memoryProfiles.get(where.userId);
        if (p) Object.assign(p, data);
        return p;
      },
    };

    // Override Wallet
    (this as any).wallet = {
      findUnique: async ({ where, include }: any) => {
        let w = null;
        if (where.userId) w = Array.from(self.memoryWallets.values()).find((x) => x.userId === where.userId);
        if (where.id) w = self.memoryWallets.get(where.id);
        if (!w) return null;
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
        const w = { id: `w-${Date.now()}`, totalReceived: 0, totalSent: 0, totalEarned: 0, status: 'ACTIVE', ...data };
        self.memoryWallets.set(w.id, w);
        return w;
      },
      update: async ({ where, data }: any) => {
        const w = self.memoryWallets.get(where.id);
        if (!w) return null;
        if (typeof data.balance === 'number') w.balance = data.balance;
        if (data.totalSent?.increment) w.totalSent += data.totalSent.increment;
        if (data.totalReceived?.increment) w.totalReceived += data.totalReceived.increment;
        return w;
      },
    };

    // Override LedgerAccount
    (this as any).ledgerAccount = {
      create: async ({ data }: any) => {
        const acc = { id: `acc-${Date.now()}`, balance: 0, ...data };
        self.memoryLedgerAccounts.set(acc.id, acc);
        return acc;
      },
      update: async ({ where, data }: any) => {
        const acc = self.memoryLedgerAccounts.get(where.id);
        if (acc) Object.assign(acc, data);
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
        return tx;
      },
      update: async ({ where, data }: any) => {
        const tx = self.memoryTransactions.get(where.id);
        if (tx) Object.assign(tx, data);
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
        return e;
      },
    };

    // Override PracticeStatistics
    (this as any).practiceStatistics = {
      findUnique: async ({ where }: any) => self.memoryStats.get(where.userId) || null,
      create: async ({ data }: any) => {
        const s = { id: `s-${Date.now()}`, ...data };
        self.memoryStats.set(data.userId, s);
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
        return req;
      },
      update: async ({ where, data }: any) => {
        const r = self.memoryFriendRequests.get(where.id);
        if (r) Object.assign(r, data);
        return r;
      },
      delete: async ({ where }: any) => {
        self.memoryFriendRequests.delete(where.id);
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
        }
        return p;
      },
      delete: async ({ where }: any) => {
        self.memoryPosts.delete(where.id);
        return { id: where.id };
      },
    };

    // Override Likes
    (this as any).like = {
      findUnique: async () => null,
      create: async ({ data }: any) => {
        const l = { id: `like-${Date.now()}`, ...data };
        self.memoryLikes.set(l.id, l);
        return l;
      },
      delete: async () => ({ count: 1 }),
    };

    // Override Comments
    (this as any).comment = {
      create: async ({ data }: any) => {
        const c = { id: `c-${Date.now()}`, createdAt: new Date(), ...data };
        self.memoryComments.set(c.id, c);
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
        return c;
      },
      update: async () => ({}),
    };

    (this as any).message = {
      findMany: async () => [],
      create: async ({ data }: any) => {
        const m = { id: `msg-${Date.now()}`, createdAt: new Date(), ...data };
        self.memoryMessages.push(m);
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
