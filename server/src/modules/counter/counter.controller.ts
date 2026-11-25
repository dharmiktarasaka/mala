import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CounterService } from './counter.service';
import { RecordSessionDto, LogDateDto } from './dto/counter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Digital Mala Counter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('counter')
export class CounterController {
  constructor(private readonly counterService: CounterService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get current user counting statistics (daily, streak, lifetime)' })
  async getStatistics(@CurrentUser() user: RequestUser) {
    return this.counterService.getStatistics(user.userId);
  }

  @Post('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record completed or saved Mala counting session' })
  async recordSession(
    @CurrentUser() user: RequestUser,
    @Body() dto: RecordSessionDto,
  ) {
    return this.counterService.recordSession(user.userId, dto);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get date-wise aggregated Mala count history by month (YYYY-MM)' })
  @ApiQuery({ name: 'month', required: false, type: String, description: 'Month in YYYY-MM format' })
  async getCalendar(
    @CurrentUser() user: RequestUser,
    @Query('month') month?: string,
  ) {
    return this.counterService.getCalendarData(user.userId, month);
  }

  @Post('log-date')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Directly save/log Mala count for a specific calendar date' })
  async logMalaForDate(
    @CurrentUser() user: RequestUser,
    @Body() dto: LogDateDto,
  ) {
    return this.counterService.logMalaForDate(user.userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get counting history sessions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @CurrentUser() user: RequestUser,
    @Query('limit') limit?: string,
  ) {
    return this.counterService.getSessionHistory(
      user.userId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}

