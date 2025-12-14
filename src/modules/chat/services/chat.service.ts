import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { OpenAIService } from './openai.service';
import { ChatRequestDto, ChatResponseDto, MonthlyUsageResponseDto } from '../dtos/chat.dto';
import { QuotaExceededException } from '../../../common/exceptions/quota-exceeded.exception';
import { Bundle, BundleStatus, BundleTier } from '@modules/subscription/entities/bundle.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
    private readonly openAIService: OpenAIService,
    private readonly configService: ConfigService,
  ) {}

  async chat(dto: ChatRequestDto & { userId: string }): Promise<ChatResponseDto> {
    await this.checkAndDeductQuota(dto.userId);

    // Get AI response
    const { answer, tokensUsed } = await this.openAIService.generateResponse(dto.question);

    // Save message
    const chatMessage = new ChatMessage();
    chatMessage.userId = dto.userId;
    chatMessage.question = dto.question;
    chatMessage.answer = answer;
    chatMessage.tokensUsed = tokensUsed;
    const saved = await this.chatMessageRepository.save(chatMessage);

    return this.toResponse(saved);
  }

  async getChatHistory(userId: string): Promise<ChatResponseDto[]> {
    const messages = await this.chatMessageRepository.find({ where: { userId } });
    return messages.map((m: ChatMessage) => this.toResponse(m));
  }

  async getMonthlyUsage(userId: string): Promise<MonthlyUsageResponseDto> {
    const bundles = await this.bundleRepository.find({
      where: { userId, status: BundleStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    return {
      bundleUsages: bundles.map((b: Bundle) => ({
        bundleId: b.id,
        tier: b.tier,
        messagesUsed: b.messagesUsed,
        maxMessages: b.maxMessages,
        remainingMessages: b.getRemainingMessages(),
      })),
    };
  }

  private async checkAndDeductQuota(userId: string): Promise<void> {
    const activeBundles = await this.bundleRepository.find({
      where: { userId, status: BundleStatus.ACTIVE },
    });

    // Check if user has any active bundles
    if (activeBundles.length === 0) {
      throw new QuotaExceededException(
        'No active subscription bundles. Please purchase a bundle to continue.',
      );
    }

    // Find bundle with most remaining quota (prioritize ENTERPRISE > PRO > BASIC)
    const bestBundle = this.findBundleWithMostQuota(activeBundles);

    if (!bestBundle || !bestBundle.hasRemainingMessages()) {
      throw new QuotaExceededException(
        'All subscription bundles exhausted. Please purchase a new bundle.',
      );
    }

    // Deduct from bundle
    bestBundle.incrementUsage();
    await this.bundleRepository.save(bestBundle);
  }

  private findBundleWithMostQuota(bundles: Bundle[]): Bundle | null {
    // Filter bundles with remaining quota
    const bundlesWithQuota = bundles.filter((b) => b.hasRemainingMessages());

    if (bundlesWithQuota.length === 0) {
      return null;
    }

    // Tier priority: ENTERPRISE > PRO > BASIC
    const tierPriority = {
      [BundleTier.ENTERPRISE]: 3,
      [BundleTier.PRO]: 2,
      [BundleTier.BASIC]: 1,
    };

    // Sort by tier priority (descending), then by remaining quota (descending), then by creation date (descending)
    bundlesWithQuota.sort((a, b) => {
      // First, prioritize by tier (ENTERPRISE > PRO > BASIC)
      const aTierPriority = tierPriority[a.tier];
      const bTierPriority = tierPriority[b.tier];
      if (aTierPriority !== bTierPriority) {
        return bTierPriority - aTierPriority; // Higher tier first
      }

      // If same tier, compare by remaining quota
      const aRemaining = a.getRemainingMessages();
      const bRemaining = b.getRemainingMessages();

      // Handle unlimited bundles (null remaining)
      if (aRemaining === null && bRemaining === null) {
        return b.createdAt.getTime() - a.createdAt.getTime(); // Most recent first
      }
      if (aRemaining === null) return -1; // Unlimited always preferred
      if (bRemaining === null) return 1;

      // Compare by remaining quota
      if (aRemaining !== bRemaining) {
        return bRemaining - aRemaining; // More remaining first
      }

      // If same remaining, prefer most recently created
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return bundlesWithQuota[0];
  }

  private toResponse(message: ChatMessage): ChatResponseDto {
    return {
      id: message.id,
      question: message.question,
      answer: message.answer,
      tokensUsed: message.tokensUsed,
      createdAt: message.createdAt,
    };
  }
}
