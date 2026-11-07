import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    let finalUsername = dto.username ? dto.username.toLowerCase().trim() : '';

    if (!finalUsername) {
      const emailPrefix = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      finalUsername = `${emailPrefix}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: finalUsername },
          dto.phone ? { phone: dto.phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (existing) {
      if (existing.email === normalizedEmail) {
        throw new ConflictException('This email address is already registered. Please log in.');
      }
      if (existing.username === finalUsername) {
        throw new ConflictException('Username is already taken. Please choose another username.');
      }
      if (dto.phone && existing.phone === dto.phone) {
        throw new ConflictException('Phone number is already registered.');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Generate unique 6-digit numeric Devotee ID (e.g. 108429, 582910)
    let devoteeId = String(Math.floor(100000 + Math.random() * 900000));
    for (let i = 0; i < 5; i++) {
      const collision = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: devoteeId }, { devoteeId }] as any,
        },
      });
      if (!collision) break;
      devoteeId = String(Math.floor(100000 + Math.random() * 900000));
    }

    // Create user with atomic profile, wallet, ledger account, stats & subscription
    const newUser: any = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: devoteeId,
          devoteeId,
          username: finalUsername,
          email: normalizedEmail,
          phone: dto.phone ? dto.phone.trim() : undefined,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
        } as any,
      });

      await tx.userProfile.create({
        data: {
          userId: user.id,
          displayName: dto.displayName,
          bio: 'Har Har Mahadev | Dedicated Mala Practitioner',
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });

      // Default ledger account for the wallet
      await tx.ledgerAccount.create({
        data: {
          walletId: wallet.id,
          accountType: 'USER_AVAILABLE',
          currency: 'MALA',
          balance: 0,
        },
      });

      await tx.practiceStatistics.create({
        data: {
          userId: user.id,
          currentDailyCount: 0,
          lifetimeCount: 0,
          currentStreakDays: 1,
          longestStreakDays: 1,
        },
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });

      return user;
    });

    const tokens = await this.generateTokens(newUser.id, newUser.username, newUser.role);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return {
      user: {
        id: newUser.id,
        devoteeId: newUser.devoteeId || newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        displayName: dto.displayName,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.toLowerCase().trim();
    const user: any = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { devoteeId: dto.identifier.trim() },
          { id: dto.identifier.trim() },
          { phone: dto.identifier.trim() },
        ],
      } as any,
      include: {
        profile: true,
        wallet: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('No devotee account found with this email or username. Please register first.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password. Please verify your password and try again.');
    }

    const tokens = await this.generateTokens(user.id, user.username, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        devoteeId: user.devoteeId || user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        displayName: user.profile?.displayName || user.username,
        avatarUrl: user.profile?.avatarUrl,
        walletBalance: user.wallet?.balance || 0,
      },
      ...tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'mala-super-secure-refresh-key-2026',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access Denied');
      }

      const isTokenValid = await bcrypt.compare(dto.refreshToken, user.refreshToken);
      if (!isTokenValid) {
        throw new UnauthorizedException('Access Denied: Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.username, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyOtpAndLogin(dto: VerifyOtpDto) {
    // Standard mock/secure OTP logic for mobile flow
    // In production, integrate Twilio/AWS SNS/Firebase Phone Auth
    if (dto.otp !== '108108' && dto.otp !== '123456') {
      throw new BadRequestException('Invalid verification code');
    }

    const phone = dto.phone.trim();
    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: { profile: true, wallet: true },
    });

    if (!user) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedUsername = `seeker_${randomSuffix}`;

      user = await this.prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            phone,
            username: generatedUsername,
            isPhoneVerified: true,
            role: 'USER',
          },
        });

        await tx.userProfile.create({
          data: {
            userId: u.id,
            displayName: dto.displayName || `Seeker ${randomSuffix}`,
          },
        });

        const wallet = await tx.wallet.create({
          data: {
            userId: u.id,
            balance: 0,
          },
        });

        await tx.ledgerAccount.create({
          data: {
            walletId: wallet.id,
            accountType: 'USER_AVAILABLE',
            currency: 'MALA',
            balance: 0,
          },
        });

        await tx.practiceStatistics.create({
          data: {
            userId: u.id,
          },
        });

        return tx.user.findUnique({
          where: { id: u.id },
          include: { profile: true, wallet: true },
        }) as any;
      });
    }

    const tokens = await this.generateTokens(user!.id, user!.username, user!.role);
    await this.updateRefreshToken(user!.id, tokens.refreshToken);

    return {
      user: {
        id: user!.id,
        username: user!.username,
        phone: user!.phone,
        role: user!.role,
        displayName: user!.profile?.displayName,
        walletBalance: user!.wallet?.balance || 0,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, username: string, role: string) {
    const payload = { sub: userId, username, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'mala-super-secure-jwt-secret-key-2026',
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'mala-super-secure-refresh-key-2026',
        expiresIn: '30d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(refreshToken, salt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}

