import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Administrator',
  })
  @IsNotEmpty({ message: 'Role name is required' })
  @IsString({ message: 'Role name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator role with full permissions',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'List of permissions (ID) assigned to the role',
    example: ['perm-123', 'perm-456', 'perm-789'],
  })
  @IsNotEmpty({ message: 'Permissions are required' })
  @ArrayMinSize(1, { message: 'At least one permission must be assigned' })
  @IsInt({ each: true })
  permission_ids: number[];
}
