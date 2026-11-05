import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
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
}

