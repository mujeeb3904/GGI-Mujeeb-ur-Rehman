import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { CreateBundleDto, BundleResponseDto } from '../dtos/subscription.dto';
import { JwtAuthGuard } from '../../../common/auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bundle } from '../entities/bundle.entity';
import { Public } from '../../../common/auth/public.decorator';
import { AuthenticatedRequest } from '../../../common/auth/authenticated-request.interface';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(Bundle)
    private readonly bundleRepository: Repository<Bundle>,
  ) {}

  @Post('bundles')
  @HttpCode(HttpStatus.CREATED)
  async createBundle(
    @Body() dto: CreateBundleDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<BundleResponseDto> {
    const userId = req.user.id;
    return await this.subscriptionService.createBundle({
      tier: dto.tier,
      billingCycle: dto.billingCycle,
      userId,
    });
  }

  @Public()
  @Get('public-bundles')
  async getPublicBundles(): Promise<BundleResponseDto[]> {
    return await this.subscriptionService.getPublicBundles();
  }

  @Get('bundles')
  async getBundles(@Request() req: AuthenticatedRequest): Promise<BundleResponseDto[]> {
    return await this.subscriptionService.getBundles(req.user.id);
  }

  @Get('bundles/active')
  async getActiveBundles(@Request() req: AuthenticatedRequest): Promise<BundleResponseDto[]> {
    return await this.subscriptionService.getActiveBundles(req.user.id);
  }

  @Patch('bundles/:bundleId/cancel')
  async cancelBundle(
    @Param('bundleId') bundleId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BundleResponseDto> {
    const bundle = await this.bundleRepository.findOne({ where: { id: bundleId } });
    if (!bundle) {
      throw new ForbiddenException('Bundle not found');
    }
    if (bundle.userId !== req.user.id) {
      throw new ForbiddenException("Unauthorized: Cannot cancel other user's bundle");
    }
    return await this.subscriptionService.cancelBundle(bundleId);
  }

  @Patch('bundles/:bundleId/renew')
  async renewBundle(
    @Param('bundleId') bundleId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BundleResponseDto> {
    const bundle = await this.bundleRepository.findOne({ where: { id: bundleId } });
    if (!bundle) {
      throw new ForbiddenException('Bundle not found');
    }
    if (bundle.userId !== req.user.id) {
      throw new ForbiddenException("Unauthorized: Cannot renew other user's bundle");
    }
    return await this.subscriptionService.renewBundle(bundleId);
  }

  @Patch('bundles/:bundleId/toggle-auto-renew')
  async toggleAutoRenew(
    @Param('bundleId') bundleId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BundleResponseDto> {
    const bundle = await this.bundleRepository.findOne({ where: { id: bundleId } });
    if (!bundle) {
      throw new ForbiddenException('Bundle not found');
    }
    if (bundle.userId !== req.user.id) {
      throw new ForbiddenException("Unauthorized: Cannot modify other user's bundle");
    }
    return await this.subscriptionService.toggleAutoRenew(bundleId);
  }
}
