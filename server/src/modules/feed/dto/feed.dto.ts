import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostCategory, PostVisibility } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ description: 'Spiritual experience, quote, or practice update' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ enum: PostCategory, default: PostCategory.GENERAL })
  @IsEnum(PostCategory)
  @IsOptional()
  category?: PostCategory;

  @ApiProperty({ enum: PostVisibility, default: PostVisibility.PUBLIC })
  @IsEnum(PostVisibility)
  @IsOptional()
  visibility?: PostVisibility;

  @ApiProperty({ required: false, description: 'Optional media image URL' })
  @IsString()
  @IsOptional()
  mediaUrl?: string;
}

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment message' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiProperty({ required: false, description: 'Parent comment ID for replies' })
  @IsString()
  @IsOptional()
  parentId?: string;
}

