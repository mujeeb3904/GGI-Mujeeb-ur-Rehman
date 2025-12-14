import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  question!: string;
}

export class ChatResponseDto {
  id!: string;
  question!: string;
  answer!: string;
  tokensUsed!: number;
  createdAt!: Date;
}

export class MonthlyUsageResponseDto {
  bundleUsages!: Array<{
    bundleId: string;
    tier: string;
    messagesUsed: number;
    maxMessages: number | null;
    remainingMessages: number | null;
  }>;
}
