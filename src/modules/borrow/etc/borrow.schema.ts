import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  versionKey: false,
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) },
})
export class Borrow extends Document {
  @Prop({ required: true, ref: 'User', type: mongoose.Schema.Types.ObjectId })
  user: string;

  @Prop({
    required: true,
    unique: true,
    ref: 'Book',
    type: mongoose.Schema.Types.ObjectId,
  })
  book: string;

  @Prop({ required: false, default: false })
  returned: boolean;

  @Prop({ required: true })
  score: number;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const BorrowSchema = SchemaFactory.createForClass(Borrow);
BorrowSchema.plugin(mongoosePaginate);
