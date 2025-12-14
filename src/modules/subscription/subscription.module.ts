import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { Bundle } from './entities/bundle.entity';

import { AutoRenewService } from './services/auto-renew.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bundle])],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, AutoRenewService],
  exports: [SubscriptionService, TypeOrmModule],
})
export class SubscriptionModule {}
