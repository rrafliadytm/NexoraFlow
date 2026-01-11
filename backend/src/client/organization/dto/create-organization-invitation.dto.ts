import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationInvitationDto {
  @ApiProperty({
    description: 'Email address of the invitee',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role (ID) to assign to the invitee',
    example: '96b985a2-870a-41f5-ab78-8f7a1d1d51dc',
  })
  @IsString()
  @IsNotEmpty()
  role_id: string;
}
