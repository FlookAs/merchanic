import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageKeys?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
