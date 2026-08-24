import { IsNumber, Min } from 'class-validator';

export class AdjustItemPriceDto {
  @IsNumber()
  @Min(0)
  adjustedUnitPrice: number;
}
