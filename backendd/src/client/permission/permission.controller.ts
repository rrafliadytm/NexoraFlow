import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Auth } from '@app/auth/decorator/auth.decorator';
import { AuthUser } from '@app/common/types/types';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@app/auth/guard/auth.guard';
import { RequirePermission } from '@app/common/decorators/require-permission.decorator';
import { permissionType } from '@app/common/types/permission.types';
import { SearchQueryDto } from '@app/common/dto/query.dto';
import { AuthorizationGuard } from '@app/common/guards/authorization.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard, AuthorizationGuard)
@ApiTags('Permission')
@Controller('organization/:organizationId/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @RequirePermission(permissionType.ROLE_READ)
  @ApiOperation({ summary: 'Get all permissions in the organization' })
  @Get()
  async findAllByOrganization(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Query() query: SearchQueryDto,
  ) {
    const result = await this.permissionService.findAllByOrganization(
      user,
      organizationId,
      query,
    );
    return {
      message: 'Permissions fetched successfully',
      result,
    };
  }
}
