import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Token of the invitation',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
