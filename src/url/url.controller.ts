import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDTO } from 'src/common/dto/url.dto';
import { GoogleAuthGuard } from 'src/common/guard/jwt.guard';
import { Request, Response } from 'express';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { RateLimitService } from 'src/common/service/rate-limiting.service';
@Controller('api')
export class UrlController {
  constructor(
    private urlService: UrlService,
    @InjectRedis() private readonly redis: Redis,
    private rateLimitService: RateLimitService,
  ) {}

  @UseGuards(GoogleAuthGuard)
  @Post('shorten')
  async createShortUrl(
    @Body() createShortUrlDto: CreateShortUrlDTO,
    @Req() req: any,
  ) {
    const { longUrl, customAlias, topic } = createShortUrlDto;
    const emailId = req?.user?.email;
    const shortUrl = await this.urlService.createShortUrl(
      longUrl,
      customAlias,
      topic,
      emailId,
    );

    await this.rateLimitService.limitRequestsByEmail(emailId, 5, 60);

    return {
      shortUrl: shortUrl.shortUrl,
      createdAt: shortUrl.created,
    };
  }

  @Get('shorten/:alias')
  async redirectToLongUrl(
    @Param('alias') alias: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const cachedLongUrl = await this.redis.get(`shortUrl:${alias}`);
      if (cachedLongUrl) {
        console.log('Cache hit for alias:', alias);
        response.redirect(cachedLongUrl);
        return;
      }
      const longUrl = await this.urlService.redirectAndTrack(alias, request);
      await this.redis.set(`shortUrl:${alias}`, longUrl, 'EX', 3600);
      response.redirect(longUrl);
    } catch (error) {
      response.status(404).send('Short URL not found');
    }
  }
}
