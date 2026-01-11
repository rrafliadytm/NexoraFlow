import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@app/auth/decorator/auth.decorator';
import { AuthUser } from '@app/common/types/types';
import { CreateOrganizationInvitationDto } from '../dto/create-organization-invitation.dto';
import { OrganizationInvitationService } from '../services/organization-invitation.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@app/auth/guard/auth.guard';
import { RequirePermission } from '@app/common/decorators/require-permission.decorator';
import { permissionType } from '@app/common/types/permission.types';
import { AuthorizationGuard } from '@app/common/guards/authorization.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard, AuthorizationGuard)
@ApiTags('Organization Invitations')
@Controller('organizations/:organizationId/invitation')
export class OrganizationInvitationController {
  constructor(
    private readonly invitationService: OrganizationInvitationService,
  ) {}

  @RequirePermission(permissionType.USER_MANAGE)
  @ApiOperation({ summary: 'Create invitation' })
  @Post()
  async createInvitation(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOrganizationInvitationDto,
  ) {
    const result = await this.invitationService.createInvitation(
      user,
      organizationId,
      dto,
    );

    return {
      message: 'Invitation created successfully',
      data: result,
    };
  }

  @RequirePermission(permissionType.USER_READ)
  @ApiOperation({ summary: 'List invitations' })
  @Get()
  async listInvitations(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
  ) {
    const data = await this.invitationService.listInvitations(
      user,
      organizationId,
    );

    return {
      message: 'Invitations fetched successfully',
      data,
    };
  }

  @RequirePermission(permissionType.USER_READ)
  @ApiOperation({ summary: 'Revoke invitation' })
  @Post(':invitationId/revoke')
  async revokeInvitation(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('invitationId') invitationId: string,
  ) {
    const data = await this.invitationService.revokeInvitation(
      user,
      organizationId,
      invitationId,
    );

    return {
      message: 'Invitation revoked successfully',
      data,
    };
  }
}
