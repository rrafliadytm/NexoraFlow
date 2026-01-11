import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@app/common/types/types';
import { InvitationService } from './invitation.service';
import { AuthGuard } from '@app/auth/guard/auth.guard';
import { Auth } from '@app/auth/decorator/auth.decorator';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Invitation')
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @ApiOperation({ summary: 'Accept organization invitation' })
  @Post('accept')
  async accept(@Auth() user: AuthUser, @Body() dto: AcceptInvitationDto) {
    const data = await this.invitationService.acceptInvitation(user, dto.token);
    return {
      message: 'Invitation accepted',
      data,
    };
  }
}
