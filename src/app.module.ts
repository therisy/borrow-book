import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { AppController } from './app.controller';
import { UserModule } from '@modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from '@modules/session/session.module';
import { BookModule } from '@modules/book/book.module';
import CONFIG from './config';

@Module({
  imports: [
    RedisModule.register({
      name: 'books',
      host: CONFIG.REDIS_HOST,
      port: 6379,
    }),
    MongooseModule.forRoot(CONFIG.MONGO_URL),
    UserModule,
    SessionModule,
    BookModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
