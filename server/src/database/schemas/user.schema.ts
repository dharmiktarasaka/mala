import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ required: true })
  fullName: string;

  @Prop({ default: '' })
  spiritualName: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: 'Sadhak' })
  tradition: string;

  @Prop({ default: 'Har Har Mahadev' })
  favoriteMantra: string;

  @Prop({ default: 'en' })
  language: string;

  @Prop({ default: 'Asia/Kolkata' })
  timezone: string;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: false })
  showMobile: boolean;

  @Prop({ default: false })
  showEmail: boolean;

  @Prop({ default: true })
  showStats: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, sparse: true, index: true, trim: true })
  id?: string;

  @Prop({ unique: true, sparse: true, index: true, trim: true })
  devoteeId?: string;

  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ unique: true, sparse: true, trim: true })
  phone?: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  username: string;

  @Prop()
  passwordHash?: string;

  @Prop({ default: 'USER', enum: ['USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN'] })
  role: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })
  status: string;

  @Prop({ type: ProfileSchema, default: () => ({}) })
  profile: Profile;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

