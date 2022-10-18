import { Injectable } from '@nestjs/common';

@Injectable()
export class BookService {
  async create() {
    return 'Book created';
  }
}
