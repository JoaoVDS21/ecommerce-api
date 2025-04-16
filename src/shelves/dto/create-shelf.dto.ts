import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateShelfDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsOptional()
  position: number;

  @IsArray()
  @IsNumber({}, {each: true})
  @Type(() => Number)
  products_ids: number[];

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  tenantId: string;
}