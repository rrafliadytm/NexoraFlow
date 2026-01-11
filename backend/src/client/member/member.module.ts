import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { CommonModule } from '@app/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
