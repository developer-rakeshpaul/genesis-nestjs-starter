import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CropQueryDto {
  @ApiProperty({
    description: 'left',
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  cl: number;

  @ApiProperty({
    description: 'top',
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  ct: number;

  @ApiProperty({
    description: 'width',
    type: Number,
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  cw: number;

  @ApiProperty({
    description: 'height',
    type: Number,
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  ch: number;
}
