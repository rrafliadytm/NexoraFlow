import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './client/organization/organization.module';
import { RoleModule } from './client/role/role.module';
import { PermissionModule } from './client/permission/permission.module';
import { InvitationModule } from './client/invitation/invitation.module';
import { MemberModule } from './client/member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RouterModule.register([
      {
        path: 'chat',
      },
    ]),
    CommonModule,
    AuthModule,
    OrganizationModule,
    RoleModule,
    PermissionModule,
    InvitationModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
