import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { Auth } from '@app/auth/decorator/auth.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@app/auth/guard/auth.guard';
import { AuthUser } from '@app/common/types/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { OwnerGuard } from '@app/common/guards/owner.guard';
import { RequireOwner } from '@app/common/decorators/require-owner.decorator';
import { RequirePermission } from '@app/common/decorators/require-permission.decorator';
import { permissionType } from '@app/common/types/permission.types';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * Organization CRUD Endpoints
   */

  @ApiOperation({ summary: 'Create a new organization' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'NexoraFlow' },
        locale: { type: 'string', example: 'id-ID' },
        timezone: { type: 'string', example: 'Asia/Jakarta' },
        contact_email: { type: 'string', example: 'contact@nexoraflow.com' },
        contact_phone: { type: 'string', example: '+6281234567890' },
        logo: { type: 'string', format: 'binary' },
      },
      required: [
        'name',
        'locale',
        'timezone',
        'contact_email',
        'contact_phone',
      ],
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  @Post()
  async create(
    @Auth() user: AuthUser,
    @Body() dto: CreateOrganizationDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const result = await this.organizationService.create(user, dto, file);
    return {
      message: 'Organization created successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get all organizations' })
  @Get()
  async findAll(@Auth() user: AuthUser) {
    const result = await this.organizationService.findAll(user);
    return {
      message: 'Organizations fetched successfully',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get organization by ID' })
  @Get(':organizationId')
  async findOne(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
  ) {
    const organization = await this.organizationService.findOne(
      user,
      organizationId,
    );
    return {
      message: 'Organization fetched successfully',
      data: organization,
    };
  }

  @RequirePermission(permissionType.ORGANIZATION_MANAGE)
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'NexoraFlow' },
        locale: { type: 'string', example: 'id-ID' },
        timezone: { type: 'string', example: 'Asia/Jakarta' },
        contact_email: { type: 'string', example: 'contact@nexoraflow.com' },
        contact_phone: { type: 'string', example: '+6281234567890' },
        logo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  @Patch(':organizationId')
  async update(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateOrganizationDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const organization = await this.organizationService.update(
      user,
      organizationId,
      dto,
      file,
    );
    return {
      message: 'Organization updated successfully',
      data: organization,
    };
  }

  /**
   * Organization Owner Endpoints
   */

  @UseGuards(OwnerGuard)
  @RequireOwner()
  @ApiOperation({ summary: 'Request organization deletion' })
  @Post(':organizationId/delete-request')
  async deleteRequest(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
  ) {
    await this.organizationService.requestDelete(user, organizationId);

    return {
      message: 'Organization deletion request cancelled successfully',
      data: null,
    };
  }

  @UseGuards(OwnerGuard)
  @RequireOwner()
  @ApiOperation({ summary: 'Cancel organization deletion request' })
  @Post(':organizationId/delete-cancel')
  async deleteCancel(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
  ) {
    await this.organizationService.cancelDeleteRequest(user, organizationId);

    return {
      message: 'Organization deletion request cancelled successfully',
      data: null,
    };
  }

  @UseGuards(OwnerGuard)
  @RequireOwner()
  @ApiOperation({ summary: 'Transfer organization ownership' })
  @Post(':organizationId/transfer-ownership/:newOwnerProfileId')
  async transferOwnership(
    @Auth() user: AuthUser,
    @Param('organizationId') organizationId: string,
    @Param('newOwnerProfileId') newOwnerProfileId: string,
  ) {
    const result = await this.organizationService.transferOwnership(
      user,
      organizationId,
      newOwnerProfileId,
    );

    return {
      message: 'Ownership transferred successfully',
      data: result,
    };
  }
}
