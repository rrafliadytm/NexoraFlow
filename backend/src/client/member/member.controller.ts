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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@app/auth/guard/auth.guard';
import { AuthorizationGuard } from '@app/common/guards/authorization.guard';
import { MemberService } from './member.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { RequirePermission } from '@app/common/decorators/require-permission.decorator';
import { permissionType } from '@app/common/types/permission.types';
import { Auth } from '@app/auth/decorator/auth.decorator';
import { AuthUser } from '@app/common/types/types';
import { ListQueryDto } from '@app/common/dto/query.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard, AuthorizationGuard)
@ApiTags('Organization Memberships')
@Controller('organizations/:organizationId/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @RequirePermission(permissionType.USER_READ)
  @ApiOperation({ summary: 'List organization memberships' })
  @Get()
  async findAll(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Query() query: ListQueryDto,
  ) {
    const result = await this.memberService.findAll(
      user,
      organizationId,
      query,
    );
    return {
      message: 'Organization memberships fetched successfully',
      result,
    };
  }

  @RequirePermission(permissionType.USER_READ)
  @ApiOperation({ summary: 'Get organization membership detail' })
  @Get(':id')
  async findOne(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    const result = await this.memberService.findOne(user, organizationId, id);
    return {
      message: 'Organization membership fetched successfully',
      result,
    };
  }

  @RequirePermission(permissionType.USER_MANAGE)
  @ApiOperation({ summary: 'Update organization membership' })
  @Patch(':id')
  async update(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    const result = await this.memberService.update(
      user,
      organizationId,
      id,
      dto,
    );
    return {
      message: 'Organization membership updated successfully',
      result,
    };
  }

  @RequirePermission(permissionType.USER_MANAGE)
  @ApiOperation({ summary: 'Remove member from organization' })
  @Delete(':id')
  async remove(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    const result = await this.memberService.remove(user, organizationId, id);
    return {
      message: 'Organization membership removed successfully',
      result,
    };
  }
}
