import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferMalaDto {
  @ApiProperty({ description: 'Recipient username, phone or User ID', example: 'priya_dev' })
  @IsString()
  @IsNotEmpty()
  recipientIdentifier: string;

  @ApiProperty({ description: 'Number of Mala to transfer', example: 10, minimum: 1 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Optional spiritual blessing / transfer note', example: 'For Tuesday Hanuman Chalisa' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Idempotency key to prevent double transfers', example: 'b947c1b5-6f1c-4b36-9289-4e4b78912d8a' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class VerifyRecipientDto {
  @ApiProperty({ description: 'Username, phone or User ID to verify before sending', example: 'priya_dev' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'Proposed amount to preview post-transfer balance', example: 10 })
  @IsNumber()
  @IsPositive()
  amount: number;
}

