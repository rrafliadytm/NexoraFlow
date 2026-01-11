import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@app/auth/guard/auth.guard';
import { AuthorizationGuard } from '@app/common/guards/authorization.guard';
import { Auth } from '@app/auth/decorator/auth.decorator';
import { AuthUser } from '@app/common/types/types';
import { RequirePermission } from '@app/common/decorators/require-permission.decorator';
import { permissionType } from '@app/common/types/permission.types';
import { ListQueryDto } from '@app/common/dto/query.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard, AuthorizationGuard)
@ApiTags('Role')
@Controller('organization/:organizationId/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePermission(permissionType.ROLE_MANAGE)
  @ApiOperation({ summary: 'Create a new role in the organization' })
  @Post()
  async create(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateRoleDto,
  ) {
    const result = await this.roleService.create(user, organizationId, dto);
    return {
      message: 'Role created successfully',
      data: result,
    };
  }

  @RequirePermission(permissionType.ROLE_READ)
  @ApiOperation({ summary: 'Get all roles in the organization' })
  @Get()
  async findAll(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Query() query: ListQueryDto,
  ) {
    const result = await this.roleService.findAll(user, organizationId, query);
    return {
      message: 'Roles fetched successfully',
      result,
    };
  }

  @RequirePermission(permissionType.ROLE_READ)
  @ApiOperation({ summary: 'Get a role by ID in the organization' })
  @Get(':roleId')
  async findOne(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
  ) {
    const result = await this.roleService.findOne(user, organizationId, roleId);
    return {
      message: 'Role fetched successfully',
      data: result,
    };
  }

  @RequirePermission(permissionType.ROLE_MANAGE)
  @ApiOperation({ summary: 'Update a role by ID in the organization' })
  @Patch(':roleId')
  async update(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const result = await this.roleService.update(
      user,
      organizationId,
      roleId,
      dto,
    );
    return {
      message: 'Role updated successfully',
      data: result,
    };
  }

  @RequirePermission(permissionType.ROLE_MANAGE)
  @ApiOperation({ summary: 'Delete a role by ID in the organization' })
  @Delete(':roleId')
  async remove(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.roleService.remove(user, organizationId, roleId);
    return {
      message: 'Role deleted successfully',
      data: null,
    };
  }
}
