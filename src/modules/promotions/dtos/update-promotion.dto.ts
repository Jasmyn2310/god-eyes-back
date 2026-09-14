import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  promoPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  validUntil?: string;
}
