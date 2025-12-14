import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, LoginDto, UserResponseDto, LoginResponseDto } from '../dtos/user.dto';
import * as bcrypt from 'bcryptjs';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import { BundleTier, BillingCycle } from '../../subscription/entities/bundle.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const user = new User();
    user.email = dto.email;
    user.name = dto.name;
    user.password = await bcrypt.hash(dto.password, 10);
    const savedUser = await this.userRepository.save(user);

    // Create default BASIC bundle for new user
    await this.subscriptionService.createBundle({
      tier: BundleTier.BASIC,
      billingCycle: BillingCycle.MONTHLY,
      userId: savedUser.id,
    });

    return this.toResponse(savedUser);
  }

  async userSignIn(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} not found`);
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.toResponse(user),
      accessToken,
    };
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
