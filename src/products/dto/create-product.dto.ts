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

  @IsBoolean()
  @Type(() => Boolean)
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  tenantId: string;

  @IsArray()
  @IsNumber({}, {each: true})
  @Type(() => Number)
  categoriesIds: number[];

  @IsOptional()
  imageUrl: string;
}