import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('borrow')
@ApiTags('Borrow')
export class BorrowController {}
