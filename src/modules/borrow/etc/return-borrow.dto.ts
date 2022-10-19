import { IsNumber, Max, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ReturnBorrowDto {
  @ApiProperty()
  @IsNumber()
  @Max(100)
  @Min(1)
  score: number;
}
