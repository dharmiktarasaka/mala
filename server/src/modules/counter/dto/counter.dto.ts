import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordSessionDto {
  @ApiProperty({ description: 'Number of beads / malas counted in this session', example: 108 })
  @IsInt()
  @Min(1)
  beadCount: number;

  @ApiProperty({ description: 'Target count set for this session', example: 108 })
  @IsInt()
  @Min(1)
  targetCount: number;

  @ApiProperty({ description: 'Session duration in seconds', example: 720 })
  @IsInt()
  @Min(0)
  durationSeconds: number;

  @ApiProperty({ description: 'Whether the target was successfully reached', example: true })
  @IsBoolean()
  completedTarget: boolean;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  soundEnabled?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  vibrationEnabled?: boolean;

  @ApiProperty({
    required: false,
    enum: ['divya_mahamala', 'jackpot', 'ram_ram', 'extra', 'bonus', 'daily_sankalp', 'daily_21'],
    default: 'daily_sankalp',
    description: 'Category / pocket for the Mala counted',
  })
  @IsString()
  @IsOptional()
  malaType?: string;

  @ApiProperty({
    required: false,
    description: 'System basis for 1 Mala count (e.g. 21, 56, or 108 beads)',
    example: 108,
  })
  @IsInt()
  @IsOptional()
  beadsPerMala?: number;

  @ApiProperty({
    required: false,
    description: 'Custom date for this session (ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)',
    example: '2026-11-25',
  })
  @IsString()
  @IsOptional()
  sessionDate?: string;

  @ApiProperty({
    required: false,
    description: 'Optional spiritual note or mantra blessing',
    example: 'Morning Gayatri Mahamantra Japa',
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class LogDateDto {
  @ApiProperty({ description: 'Date to log counts for in YYYY-MM-DD format', example: '2026-11-25' })
  @IsString()
  date: string;

  @ApiProperty({ required: false, description: 'Number of Malas counted (1 Mala = 108 beads)', example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  malas?: number;

  @ApiProperty({ required: false, description: 'Direct number of beads counted', example: 108 })
  @IsInt()
  @Min(1)
  @IsOptional()
  beads?: number;

  @ApiProperty({
    required: false,
    enum: ['divya_mahamala', 'jackpot', 'ram_ram', 'extra', 'bonus', 'daily_sankalp', 'daily_21'],
    default: 'daily_sankalp',
    description: 'Category / pocket for the Mala counted',
  })
  @IsString()
  @IsOptional()
  malaType?: string;

  @ApiProperty({
    required: false,
    description: 'System basis for 1 Mala count (e.g. 21, 56, or 108 beads)',
    example: 108,
  })
  @IsInt()
  @IsOptional()
  beadsPerMala?: number;

  @ApiProperty({ required: false, description: 'Optional devotional note or mantra' })
  @IsString()
  @IsOptional()
  note?: string;
}

