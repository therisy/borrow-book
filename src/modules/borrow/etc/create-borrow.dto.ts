import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty()
  @IsMongoId()
  book: string;
}
