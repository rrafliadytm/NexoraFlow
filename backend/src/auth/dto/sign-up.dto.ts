import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Match } from '@app/common/decorators/match.decorator';

export class SignUpDto {
  @ApiProperty({ example: 'ai.nexoraflow@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'NexoraFlow!123' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @ApiProperty({ example: 'NexoraFlow!123' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;

  @ApiProperty({ example: 'Nexora' })
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @ApiPropertyOptional({ example: 'Flow' })
  @IsOptional()
  last_name?: string;
}
