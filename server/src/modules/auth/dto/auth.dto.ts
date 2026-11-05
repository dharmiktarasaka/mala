import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'raman_bhakt' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Raman Sharma' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: 'raman@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'MalaPass@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'raman_bhakt' })
  @IsString()
  @IsNotEmpty()
  identifier: string; // username, email, or phone

  @ApiProperty({ example: 'MalaPass@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class SocialAuthDto {
  @ApiProperty({ example: 'google' })
  @IsString()
  provider: 'google' | 'apple';

  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ required: false })
  @IsOptional()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email?: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '108108' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ required: false })
  @IsOptional()
  displayName?: string;
}

