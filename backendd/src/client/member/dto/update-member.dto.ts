import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto {
  @ApiProperty({
    description: 'Display name',
  })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiProperty({
    description: 'Role (ID) to assign to the member',
    example: '96b985a2-870a-41f5-ab78-8f7a1d1d51dc',
  })
  @IsString()
  @IsOptional()
  role_id?: string;
}
