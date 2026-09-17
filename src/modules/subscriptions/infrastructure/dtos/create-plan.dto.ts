import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

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
