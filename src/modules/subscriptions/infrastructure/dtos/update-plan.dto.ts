import { IsBoolean, IsIn, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @IsString()
  @IsIn(['vendor', 'client'])
  @IsOptional()
  targetRole?: 'vendor' | 'client';

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationDays?: number;
}
