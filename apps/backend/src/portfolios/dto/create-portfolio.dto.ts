import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  imageKey?: string;

  @IsUUID()
  @IsOptional()
  relatedServiceId?: string;
}
