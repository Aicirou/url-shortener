import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateLimitService {
  constructor(@InjectRedis() private readonly redisService: Redis) {}

  /**
   * Limits requests per email
   * @param emailId
   * @param maxRequests
   * @param ttl
   */
  async limitRequestsByEmail(
    emailId: string,
    maxRequests: number,
    ttl: number,
  ): Promise<void> {
    const key = `rate_limit:${emailId}`;
    const current = await this.redisService.incr(key);

    if (current === 1) {
      await this.redisService.expire(key, ttl);
    }

    if (current > maxRequests) {
      throw new HttpException(
        `Rate limit exceeded. You can try again in ${ttl} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
