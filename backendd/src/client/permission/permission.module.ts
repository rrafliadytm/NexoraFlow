import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { CommonModule } from '@app/common/common.module';
import { OrganizationModule } from '@app/client/organization/organization.module';

@Module({
  imports: [CommonModule, OrganizationModule],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
