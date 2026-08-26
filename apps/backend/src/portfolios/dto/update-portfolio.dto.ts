import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePortfolioDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageKeys?: string[];

  @IsUUID()
  @IsOptional()
  relatedServiceId?: string;
}
