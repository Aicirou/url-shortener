import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrl } from 'src/entities/short_url.entity';
import { ShortUrlLogs } from 'src/entities/short_url_logs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShortUrlLogsDal {
  constructor(
    @InjectRepository(ShortUrl) private readonly shortUrl: Repository<ShortUrl>,
    @InjectRepository(ShortUrlLogs)
    private readonly shortUrlLogs: Repository<ShortUrlLogs>,
  ) {}

  async createShortUrlLogs(data): Promise<ShortUrlLogs> {
    try {
      const { shortUrl, ip, osName, deviceName } = data;

      const ipExists = await this.shortUrlLogs.findOne({
        where: { shortUrl: { alias: shortUrl.alias }, ip },
      });

      const shortUrlLogs = this.shortUrlLogs.create({
        shortUrl,
        ip,
        osName,
        deviceName,
      });
      await this.shortUrlLogs.save(shortUrlLogs);

      const today = new Date().toISOString().split('T')[0];
      let clickByDate = [...shortUrl.clickByDate];

      const dateEntry = clickByDate.find((entry) => entry.date === today);
      if (dateEntry) {
        dateEntry.click_count += 1;
      } else {
        clickByDate.push({ date: today, click_count: 1 });
      }

      if (clickByDate.length > 7) {
        clickByDate = clickByDate.slice(-7);
      }

      shortUrl.clickByDate = clickByDate;

      await this.shortUrl.update(
        { alias: shortUrl.alias },
        {
          clickByDate,
        },
      );

      if (!ipExists) {
        await this.shortUrl.update(
          { alias: shortUrl.alias },
          {
            totalClicks: () => 'total_clicks + 1',
            uniqueClicks: () => 'unique_clicks + 1',
          },
        );
      } else {
        await this.shortUrl.update(
          { alias: shortUrl.alias },
          {
            totalClicks: () => 'total_clicks + 1',
          },
        );
      }

      return shortUrlLogs;
    } catch (error) {
      throw new Error('Error saving short URL log');
    }
  }
}
