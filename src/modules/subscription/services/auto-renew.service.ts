import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Bundle, BundleStatus } from '../entities/bundle.entity';

/**
 * Service to handle automatic subscription renewal.
 * Checks for subscriptions that need renewal and processes them.
 */
@Injectable()
export class AutoRenewService {
  private readonly logger = new Logger(AutoRenewService.name);

  constructor(
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
  ) {}

  /**
   * Runs every hour to check for subscriptions that need renewal
   * Processes subscriptions where renewalDate has passed and autoRenew is enabled
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'auto-renew-subscriptions',
  })
  async handleAutoRenewal() {
    this.logger.log('Checking for subscriptions that need renewal...');

    try {
      const now = new Date();

      // Find all active bundles that:
      // 1. Have autoRenew enabled
      // 2. Have reached their renewalDate
      // 3. Are still active (not cancelled)
      const bundlesToRenew = await this.bundleRepository.find({
        where: {
          status: BundleStatus.ACTIVE,
          autoRenew: true,
        },
      });

      const bundlesNeedingRenewal = bundlesToRenew.filter(
        (bundle) => bundle.renewalDate && bundle.renewalDate <= now,
      );

      this.logger.log(`Found ${bundlesNeedingRenewal.length} bundles needing renewal`);

      let renewedCount = 0;
      let failedCount = 0;

      for (const bundle of bundlesNeedingRenewal) {
        try {
          // Simulate payment failure (10% chance)
          const paymentFailed = Math.random() < 0.1;

          if (paymentFailed) {
            bundle.markPaymentFailed();
            this.logger.warn(
              `Payment failed for bundle ${bundle.id} (user: ${bundle.userId}, tier: ${bundle.tier})`,
            );
            failedCount++;
          } else {
            bundle.renew();
            this.logger.log(
              `Renewed bundle ${bundle.id} (user: ${bundle.userId}, tier: ${bundle.tier})`,
            );
            renewedCount++;
          }

          await this.bundleRepository.save(bundle);
        } catch (error) {
          this.logger.error(`Error renewing bundle ${bundle.id}:`, error);
          failedCount++;
        }
      }

      this.logger.log(`Auto-renewal completed. Renewed: ${renewedCount}, Failed: ${failedCount}`);
    } catch (error) {
      this.logger.error('Error during auto-renewal process:', error);
    }
  }
}
