import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { ChatRequestDto, ChatResponseDto, MonthlyUsageResponseDto } from '../dtos/chat.dto';
import { JwtAuthGuard } from '../../../common/auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../../../common/auth/authenticated-request.interface';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() dto: ChatRequestDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ChatResponseDto> {
    const userId = req.user.id;
    return await this.chatService.chat({ question: dto.question, userId });
  }

  @Get('history')
  async getChatHistory(@Request() req: AuthenticatedRequest): Promise<ChatResponseDto[]> {
    const userId = req.user.id;
    return await this.chatService.getChatHistory(userId);
  }

  @Get('usage')
  async getMonthlyUsage(@Request() req: AuthenticatedRequest): Promise<MonthlyUsageResponseDto> {
    const userId = req.user.id;
    return await this.chatService.getMonthlyUsage(userId);
  }
}
