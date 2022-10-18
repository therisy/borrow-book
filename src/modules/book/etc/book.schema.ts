import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  versionKey: false,
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) },
})
export class Book extends Document {
  @Prop({ required: true })
  etag: string;

  @Prop({ required: true, unique: true })
  volumeId: string;

  @Prop({ required: true, unique: true, min: 4, max: 20 })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  authors: string[];

  @Prop({ required: true })
  publishedDate: string;

  @Prop({ required: false, default: 0 })
  pageCount: number;

  @Prop({ required: false })
  categories: string[];

  @Prop({ required: false })
  country: string;

  @Prop({ required: false })
  previewLink: string;

  @Prop({ required: false })
  thumbnail: string;

  @Prop({ required: false })
  smallThumbnail: string;

  @Prop({ required: true, ref: 'User', type: mongoose.Schema.Types.ObjectId })
  creator: string;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.plugin(mongoosePaginate);
