import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum BundleTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum BundleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
}

@Entity('bundles')
@Index(['userId'])
@Index(['status'])
export class Bundle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.bundles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: BundleTier })
  tier!: BundleTier;

  @Column({ name: 'max_messages', type: 'int', nullable: true })
  maxMessages!: number | null;

  @Column({ name: 'messages_used', type: 'int', default: 0 })
  messagesUsed!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'billing_cycle', type: 'enum', enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column({ type: 'enum', enum: BundleStatus, default: BundleStatus.ACTIVE })
  status!: BundleStatus;

  @Column({ name: 'auto_renew', type: 'boolean', default: true })
  autoRenew!: boolean;

  @Column({ name: 'start_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate!: Date;

  @Column({ name: 'renewal_date', type: 'timestamp', nullable: true })
  renewalDate!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'payment_failed_at', type: 'timestamp', nullable: true })
  paymentFailedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  static create(
    userId: string,
    tier: BundleTier,
    maxMessages: number | null,
    price: number,
    billingCycle: BillingCycle,
  ): Bundle {
    const bundle = new Bundle();
    bundle.userId = userId;
    bundle.tier = tier;
    bundle.maxMessages = maxMessages;
    bundle.messagesUsed = 0;
    bundle.price = price;
    bundle.billingCycle = billingCycle;
    bundle.status = BundleStatus.ACTIVE;
    bundle.autoRenew = true;
    bundle.startDate = new Date();
    bundle.endDate = Bundle.calculateEndDate(new Date(), billingCycle);
    bundle.renewalDate = bundle.endDate;
    bundle.cancelledAt = null;
    bundle.paymentFailedAt = null;
    return bundle;
  }

  private static calculateEndDate(startDate: Date, cycle: BillingCycle): Date {
    const endDate = new Date(startDate);
    if (cycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  hasRemainingMessages(): boolean {
    if (this.maxMessages === null) return true;
    return this.messagesUsed < this.maxMessages;
  }

  getRemainingMessages(): number | null {
    if (this.maxMessages === null) return null;
    return Math.max(0, this.maxMessages - this.messagesUsed);
  }

  incrementUsage(): void {
    this.messagesUsed += 1;
  }

  isActive(): boolean {
    return this.status === BundleStatus.ACTIVE;
  }

  cancel(): void {
    this.status = BundleStatus.CANCELLED;
    this.cancelledAt = new Date();
    this.autoRenew = false;
  }

  markPaymentFailed(): void {
    this.status = BundleStatus.INACTIVE;
    this.paymentFailedAt = new Date();
  }

  renew(): void {
    if (!this.autoRenew) {
      throw new Error('Cannot renew a bundle with auto-renew disabled');
    }

    this.messagesUsed = 0;
    this.status = BundleStatus.ACTIVE;
    this.endDate = Bundle.calculateEndDate(new Date(), this.billingCycle);
    this.renewalDate = this.endDate;
    this.paymentFailedAt = null;
  }
}
