import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { OpenAIService } from './services/openai.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ChatMessage } from './entities/chat-message.entity';
import { Bundle } from '../subscription/entities/bundle.entity';

import { QuotaResetService } from './services/quota-reset-cron';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, Bundle]), SubscriptionModule],
  controllers: [ChatController],
  providers: [ChatService, OpenAIService, QuotaResetService],
  exports: [ChatService],
})
export class ChatModule {}
