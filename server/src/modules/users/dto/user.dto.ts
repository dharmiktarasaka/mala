import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  bio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ required: false, example: 'en' })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @ApiProperty({ required: false, example: 'saffron' })
  @IsString()
  @IsOptional()
  theme?: string;
}

export class UpdatePrivacySettingsDto {
  @ApiProperty({ required: false, description: 'Keep entire profile private' })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiProperty({ required: false, description: 'Display personal counted mala count publicly' })
  @IsBoolean()
  @IsOptional()
  showMalaCount?: boolean;

  @ApiProperty({ required: false, description: 'Display wallet balance publicly (defaults to false)' })
  @IsBoolean()
  @IsOptional()
  showWalletBalance?: boolean;
}

