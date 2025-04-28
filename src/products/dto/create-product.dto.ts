import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  stock: number;
  
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive: boolean;

  @IsString()
  @IsOptional()
  tenantId: string;

  @IsOptional()
  imageUrl: string;
}