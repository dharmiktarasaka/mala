export interface User {
  id: string;
  devoteeId?: string;
  username: string;
  email?: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  displayName: string;
  avatarUrl?: string;
  walletBalance: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  isPrivate: boolean;
  showMalaCount: boolean;
  showWalletBalance: boolean;
  preferredLanguage: string;
  theme: string;
}

export interface WalletDashboard {
  walletId: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  totalEarned: number;
  status: string;
  username: string;
  displayName: string;
  devoteeId?: string;
  qrPayload: string;
  recentTransactions: TransactionSummary[];
}

export interface TransactionSummary {
  id: string;
  transactionType: string;
  status: string;
  amount: number;
  direction: 'SENT' | 'RECEIVED' | 'SYSTEM';
  note?: string;
  createdAt: string;
  counterparty: {
    userId?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface TransferReceipt {
  receiptId: string;
  status: string;
  amount: number;
  note?: string;
  createdAt: string;
  sender: {
    userId: string;
    username: string;
    displayName: string;
    remainingBalance: number;
  };
  recipient: {
    userId: string;
    username: string;
    displayName: string;
    newBalance: number;
  };
}

export interface Post {
  id: string;
  content: string;
  category: string;
  visibility: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLikedByMe: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  media?: { id: string; mediaUrl: string }[];
  recentComments?: {
    id: string;
    content: string;
    author: { username: string; displayName: string };
  }[];
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  dataJson?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  targetValue: number;
  category: string;
  isUnlocked: boolean;
  progress: number;
}

