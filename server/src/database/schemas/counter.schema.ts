import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CounterSessionDocument = HydratedDocument<CounterSession>;

@Schema({ timestamps: true })
export class CounterSession extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, default: 108 })
  targetBeads: number;

  @Prop({ required: true, default: 0 })
  beadsCounted: number;

  @Prop({ required: true, default: 0 })
  malasCompleted: number;

  @Prop({ default: 'Om Namah Shivaya' })
  mantra: string;

  @Prop({ default: 0 })
  durationSeconds: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: true })
  hapticEnabled: boolean;

  @Prop({ default: true })
  soundEnabled: boolean;

  @Prop({ default: () => new Date() })
  startedAt: Date;

  @Prop()
  completedAt?: Date;
}

export const CounterSessionSchema = SchemaFactory.createForClass(CounterSession);
CounterSessionSchema.index({ userId: 1, startedAt: -1 });

