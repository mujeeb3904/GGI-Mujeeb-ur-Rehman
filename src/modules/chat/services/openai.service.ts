import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OpenAIResponse {
  answer: string;
  tokensUsed: number;
}

@Injectable()
export class OpenAIService {
  private readonly minDelay: number;
  private readonly maxDelay: number;
  private readonly minTokens: number;
  private readonly maxTokens: number;

  private readonly responses = [
    'That is an interesting question! Based on my analysis, here is what I can tell you...',
    'I understand your inquiry. Let me provide you with a comprehensive response...',
    'Thank you for asking. The answer involves considering multiple factors...',
    'Great question! After processing your input, here is what I found...',
    'Let me break this down for you with a detailed explanation...',
  ];

  constructor(private readonly configService: ConfigService) {
    this.minDelay = this.configService.get<number>('MOCK_OPENAI_MIN_DELAY_MS', 200);
    this.maxDelay = this.configService.get<number>('MOCK_OPENAI_MAX_DELAY_MS', 800);
    this.minTokens = this.configService.get<number>('MOCK_OPENAI_MIN_TOKENS', 50);
    this.maxTokens = this.configService.get<number>('MOCK_OPENAI_MAX_TOKENS', 500);
  }

  async generateResponse(_question: string): Promise<OpenAIResponse> {
    // Simulate API delay
    const delay = this.randomBetween(this.minDelay, this.maxDelay);
    await this.sleep(delay);

    // Generate response
    const answer = this.responses[Math.floor(Math.random() * this.responses.length)];
    const tokensUsed = this.randomBetween(this.minTokens, this.maxTokens);

    return { answer, tokensUsed };
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
