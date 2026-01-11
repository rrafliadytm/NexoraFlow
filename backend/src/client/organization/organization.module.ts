import { Module } from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { OrganizationController } from './controllers/organization.controller';
import { CommonModule } from '@app/common/common.module';
import { OrganizationInvitationService } from './services/organization-invitation.service';
import { OrganizationInvitationController } from './controllers/organization-invitation.controller';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [CommonModule, RoleModule],
  controllers: [OrganizationController, OrganizationInvitationController],
  providers: [OrganizationService, OrganizationInvitationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
