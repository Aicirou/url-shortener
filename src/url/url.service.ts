import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ShortUrlDal } from 'src/dal/shortUrl.dal';
import { ShortUrl } from 'src/entities/short_url.entity';
import { ShortUrlLogsDal } from 'src/dal/shortUrlLogs.dal';
import { Request } from 'express';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class UrlService {
  constructor(
    private shortUrlDal: ShortUrlDal,
    private shortUrlLogsDal: ShortUrlLogsDal,
    
  ) {}
  async createShortUrl(
    longUrl: string,
    customAlias?: string,
    topic?: string,
    emailId?:string
  ): Promise<ShortUrl> {
    const alias = customAlias || this.generateAlias();
    const existingAlias = await this.shortUrlDal.findByAlias(alias);
    if (existingAlias) {
      throw new ConflictException('Custom alias already in use');
    }

    const shortUrl = new ShortUrl();
    shortUrl.longUrl = longUrl;
    shortUrl.alias = alias;
    shortUrl.topic = topic || 'Other';
    shortUrl.shortUrl = `${
      process.env.BASE_URL || 'http://localhost:3000'
    }/${alias}`;
    shortUrl.emailId = emailId;
    return this.shortUrlDal.createShortUrl(shortUrl);
  }

  private generateAlias(): string {
    return uuidv4().slice(0, 8);
  }

  async redirectAndTrack(alias: string, request: Request): Promise<string> {
    const shortUrl = await this.shortUrlDal.findByAlias(alias);
    if (!shortUrl) {
      throw new NotFoundException('Short URL not found');
    }
    const ip = request?.ip;
    const userAgent = request.headers['user-agent'] || '';
    const osName = this.getOSFromUserAgent(userAgent);
    const deviceName = this.getDeviceFromUserAgent(userAgent);
    const data = {
      shortUrl,
      ip,
      osName,
      deviceName,
    };
     await this.shortUrlLogsDal.createShortUrlLogs(data);
    return shortUrl.longUrl;
  }

  private getOSFromUserAgent(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh/i.test(userAgent)) return 'Mac OS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  private getDeviceFromUserAgent(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  }
}
