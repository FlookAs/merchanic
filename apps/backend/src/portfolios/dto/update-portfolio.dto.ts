import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePortfolioDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageKey?: string;

  @IsUUID()
  @IsOptional()
  relatedServiceId?: string;
}
