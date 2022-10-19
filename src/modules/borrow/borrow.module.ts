import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BorrowController } from './borrow.controller';
import { BorrowService } from '@modules/borrow/borrow.service';
import { BookSchema } from '@modules/book/etc/book.schema';
import { BorrowSchema } from '@modules/borrow/etc/borrow.schema';
import { BookModule } from '@modules/book/book.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Book', schema: BookSchema },
      { name: 'Borrow', schema: BorrowSchema },
    ]),
    BookModule,
  ],
  controllers: [BorrowController],
  providers: [BorrowService],
})
export class BorrowModule {}
