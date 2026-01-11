import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { CommonModule } from '@app/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
