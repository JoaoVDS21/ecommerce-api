import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  position: number;

  @IsBoolean()
  @Type(() => Boolean)
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  tenantId: string;

  @IsOptional()
  imageUrl: string;
}