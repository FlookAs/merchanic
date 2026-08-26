import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CreateQuoteItemDto } from './create-quote-item.dto.js';

export class CreateQuoteRequestDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0\d{8,9}$/, { message: 'เบอร์โทรไม่ถูกต้อง (ตัวอย่าง: 0812345678)' })
  phone!: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items!: CreateQuoteItemDto[];
}
