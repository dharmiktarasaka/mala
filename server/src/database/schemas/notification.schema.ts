import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({
    required: true,
    enum: [
      'MALA_RECEIVED',
      'MALA_SENT',
      'FRIEND_REQUEST',
      'FRIEND_ACCEPTED',
      'NEW_MESSAGE',
      'POST_LIKE',
      'POST_COMMENT',
      'ACHIEVEMENT_UNLOCKED',
      'PRACTICE_REMINDER',
      'SYSTEM_ALERT',
    ],
  })
  type: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Object, default: () => ({}) })
  metadata: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

