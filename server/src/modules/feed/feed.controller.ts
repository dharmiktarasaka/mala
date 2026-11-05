import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { CreatePostDto, CreateCommentDto } from './dto/feed.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { PostCategory } from '@prisma/client';

@ApiTags('Social Community Feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post('posts')
  @ApiOperation({ summary: 'Create a new post in the spiritual community' })
  async createPost(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePostDto,
  ) {
    return this.feedService.createPost(user.userId, dto);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get community feed posts' })
  @ApiQuery({ name: 'filter', enum: ['home', 'friends', 'explore'], required: false })
  @ApiQuery({ name: 'category', enum: PostCategory, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(
    @CurrentUser() user: RequestUser,
    @Query('filter') filter?: 'home' | 'friends' | 'explore',
    @Query('category') category?: PostCategory,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getFeed(
      user.userId,
      filter || 'home',
      category,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('posts/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a post' })
  async toggleLike(
    @CurrentUser() user: RequestUser,
    @Param('id') postId: string,
  ) {
    return this.feedService.toggleLike(user.userId, postId);
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Add comment to a post' })
  async addComment(
    @CurrentUser() user: RequestUser,
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.feedService.addComment(user.userId, postId, dto);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get comments on a post' })
  async getComments(@Param('id') postId: string) {
    return this.feedService.getComments(postId);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a post (owner or admin only)' })
  async deletePost(
    @CurrentUser() user: RequestUser,
    @Param('id') postId: string,
  ) {
    return this.feedService.deletePost(user.userId, postId);
  }
}

