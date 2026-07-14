import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { InputType } from '../../../entities';

export class CreateVerificationDto {
  @ApiProperty({ enum: InputType, example: InputType.TEXT })
  @IsEnum(InputType)
  inputType!: InputType;

  @ApiProperty({
    example: 'The Great Wall of China is visible from space with the naked eye.',
    description: 'Raw input: a URL, tweet, or text block. For images, a base64 data URL.',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20000)
  input!: string;

  @ApiProperty({ required: false, description: 'Optional wallet address of the submitter.' })
  @IsOptional()
  @IsString()
  walletAddress?: string;
}
