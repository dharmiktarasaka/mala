import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;
export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true, index: true })
  postId: string;

  @Prop({ required: true, index: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop()
  authorAvatar?: string;

  @Prop({ required: true })
  content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true, index: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop()
  authorAvatar?: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  mantraText?: string;

  @Prop({
    default: 'PRACTICE',
    enum: ['PRACTICE', 'QUOTES', 'MEDITATION', 'BHAKTI', 'ACHIEVEMENTS', 'COMMUNITY', 'GENERAL'],
  })
  category: string;

  @Prop({ default: 'PUBLIC', enum: ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'] })
  visibility: string;

  @Prop({ type: [String], default: [] })
  likedUserIds: string[];

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ createdAt: -1 });
PostSchema.index({ category: 1, createdAt: -1 });

