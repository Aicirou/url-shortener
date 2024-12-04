import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrl } from 'src/entities/short_url.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShortUrlDal {
  constructor(
    @InjectRepository(ShortUrl) private readonly shortUrl: Repository<ShortUrl>,
  ) {}

  async findByAlias(alias: string) {
    return await this.shortUrl.findOne({
      where: { alias },
    });
  }

  async createShortUrl(shortUrl): Promise<ShortUrl> {
    return await this.shortUrl.save(shortUrl);
  }
}
