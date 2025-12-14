import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Bundle, BundleTier, BillingCycle, BundleStatus } from '../entities/bundle.entity';
import { CreateBundleDto, BundleResponseDto } from '../dtos/subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
    private readonly configService: ConfigService,
  ) {}

  async createBundle(dto: CreateBundleDto & { userId: string }): Promise<BundleResponseDto> {
    const { maxMessages, price } = this.getBundleConfig(dto.tier, dto.billingCycle);

    const bundle = Bundle.create(dto.userId, dto.tier, maxMessages, price, dto.billingCycle);

    const savedBundle = await this.bundleRepository.save(bundle);
    return this.toResponse(savedBundle);
  }

  async getPublicBundles(): Promise<BundleResponseDto[]> {
    const bundles = await this.bundleRepository.find({
      where: { status: BundleStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    return bundles.map((b) => this.toResponse(b));
  }

  async getBundles(userId: string): Promise<BundleResponseDto[]> {
    const bundles = await this.bundleRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return bundles.map((b) => this.toResponse(b));
  }

  async getActiveBundles(userId: string): Promise<BundleResponseDto[]> {
    const bundles = await this.bundleRepository.find({
      where: { userId, status: BundleStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    return bundles.map((b) => this.toResponse(b));
  }

  async cancelBundle(bundleId: string): Promise<BundleResponseDto> {
    const bundle = await this.bundleRepository.findOne({ where: { id: bundleId } });
    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${bundleId} not found`);
    }

    bundle.cancel();
    const updated = await this.bundleRepository.save(bundle);
    return this.toResponse(updated);
  }

  async renewBundle(bundleId: string): Promise<BundleResponseDto> {
    const bundle = await this.bundleRepository.findOne({ where: { id: bundleId } });
    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${bundleId} not found`);
    }

    const paymentFailed = Math.random() < 0.1;
    if (paymentFailed) {
      bundle.markPaymentFailed();
    } else {
      bundle.renew();
    }

    const updated = await this.bundleRepository.save(bundle);
    return this.toResponse(updated);
  }

  async toggleAutoRenew(bundleId: string): Promise<BundleResponseDto> {
    const bundle = await this.bundleRepository.findOne({ where: { id: bundleId } });
    if (!bundle) {
      throw new NotFoundException(`Bundle with ID ${bundleId} not found`);
    }

    bundle.autoRenew = !bundle.autoRenew;
    const updated = await this.bundleRepository.save(bundle);
    return this.toResponse(updated);
  }

  private getBundleConfig(
    tier: BundleTier,
    cycle: BillingCycle,
  ): { maxMessages: number | null; price: number } {
    const configs = {
      [BundleTier.BASIC]: { maxMessages: 10, monthlyPrice: 9.99 },
      [BundleTier.PRO]: { maxMessages: 100, monthlyPrice: 49.99 },
      [BundleTier.ENTERPRISE]: { maxMessages: null, monthlyPrice: 199.99 },
    };

    const config = configs[tier];
    const price = cycle === BillingCycle.YEARLY ? config.monthlyPrice * 10 : config.monthlyPrice;

    return { maxMessages: config.maxMessages, price };
  }

  private toResponse(bundle: Bundle): BundleResponseDto {
    return {
      id: bundle.id,
      tier: bundle.tier,
      maxMessages: bundle.maxMessages,
      messagesUsed: bundle.messagesUsed,
      remainingMessages: bundle.getRemainingMessages(),
      price: bundle.price,
      billingCycle: bundle.billingCycle,
      status: bundle.status,
      autoRenew: bundle.autoRenew,
      startDate: bundle.startDate,
      endDate: bundle.endDate,
      createdAt: bundle.createdAt,
    };
  }
}
