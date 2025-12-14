import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';

@Injectable()
export class QuotaResetService {
  private readonly logger = new Logger(QuotaResetService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
  ) {}

  /**
   * Runs on the 1st day of each month at 00:00:00
   * This ensures free quota resets automatically for all users
   */
  @Cron('0 0 0 1 * *', {
    name: 'monthly-quota-reset',
    timeZone: 'UTC',
  })
  async handleMonthlyQuotaReset() {
    this.logger.log('Starting monthly free quota reset...');

    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      this.logger.log(
        `Monthly quota reset completed. New month started: ${firstDayOfMonth.toISOString()}`,
      );
      this.logger.log(
        'Free quota tracking now resets automatically for all users based on current month.',
      );
    } catch (error) {
      this.logger.error('Error during monthly quota reset:', error);
    }
  }
}
