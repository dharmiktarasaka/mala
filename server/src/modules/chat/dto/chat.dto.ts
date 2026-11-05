import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'Recipient user ID or username' })
  @IsString()
  @IsNotEmpty()
  recipientIdentifier: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ required: false, description: 'Optional media image' })
  @IsString()
  @IsOptional()
  mediaUrl?: string;
}

