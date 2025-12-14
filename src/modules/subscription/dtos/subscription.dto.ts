import { IsEnum } from 'class-validator';
import { BundleTier, BillingCycle } from '../entities/bundle.entity';

export class CreateBundleDto {
  @IsEnum(BundleTier)
  tier!: BundleTier;

  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;
}

export class BundleResponseDto {
  id!: string;
  tier!: string;
  maxMessages!: number | null;
  messagesUsed!: number;
  remainingMessages!: number | null;
  price!: number;
  billingCycle!: string;
  status!: string;
  autoRenew!: boolean;
  startDate!: Date;
  endDate!: Date;
  createdAt!: Date;
}
