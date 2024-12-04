import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrl } from 'src/entities/short_url.entity';
import { ShortUrlUniqueDevice } from 'src/entities/short_url_device.entity';
import { ShortUrlUniqueOS } from 'src/entities/short_url_os.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsDal {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepository: Repository<ShortUrl>,
  ) {}

  async getAnalytics(alias: string) {
    const shortUrlAnalytics = await this.shortUrlRepository
      .createQueryBuilder('shortUrl')
      .leftJoinAndSelect('shortUrl.uniqueDevices', 'device')
      .leftJoinAndSelect('shortUrl.uniqueOS', 'os')
      .where('shortUrl.alias = :alias', { alias })
      .select([
        'shortUrl.totalClicks',
        'shortUrl.uniqueClicks',
        'shortUrl.clickByDate',
        'device.deviceName',
        'device.ukClick',
        'device.ukUser',
        'os.osName',
        'os.ukClick',
        'os.ukUser',
      ])
      .getOne();

    if (!shortUrlAnalytics) {
      throw new NotFoundException('Short URL not found');
    }

    return {
      totalClicks: shortUrlAnalytics.totalClicks,
      uniqueClicks: shortUrlAnalytics.uniqueClicks,
      clicksByDate: shortUrlAnalytics.clickByDate,
      osType: shortUrlAnalytics.uniqueOS.map((os) => ({
        osName: os.osName,
        uniqueClicks: os.ukClick,
        uniqueUsers: os.ukUser,
      })),
      deviceType: shortUrlAnalytics.uniqueDevices.map((device) => ({
        deviceName: device.deviceName,
        uniqueClicks: device.ukClick,
        uniqueUsers: device.ukUser,
      })),
    };
  }

  async getAnalyticsByTopic(topic: string) {
    const analytics = await this.shortUrlRepository
      .createQueryBuilder('shortUrl')
      .select([
        'shortUrl.shortUrl',
        'shortUrl.totalClicks',
        'shortUrl.uniqueClicks',
        'shortUrl.clickByDate',
      ])
      .where('shortUrl.topic = :topic', { topic })
      .getMany();

    if (analytics.length === 0) {
      throw new NotFoundException(
        'No short URLs found under the specified topic',
      );
    }

    const totalClicks = analytics.reduce(
      (sum, url) => sum + url.totalClicks,
      0,
    );
    const uniqueClicks = analytics.reduce(
      (sum, url) => sum + url.uniqueClicks,
      0,
    );

    return {
      totalClicks,
      uniqueClicks,
      clicksByDate: analytics.map((url) => url.clickByDate),
      urls: analytics.map((url) => ({
        shortUrl: url.shortUrl,
        totalClicks: url.totalClicks,
        uniqueClicks: url.uniqueClicks,
      })),
    };
  }

  async getOverallAnalytics(emailId: string) {
    const shortUrls = await this.shortUrlRepository
      .createQueryBuilder('shortUrl')
      .leftJoinAndSelect('shortUrl.uniqueOS', 'uniqueOS')
      .leftJoinAndSelect('shortUrl.uniqueDevices', 'uniqueDevices')
      .select([
        'shortUrl.id',
        'shortUrl.shortUrl',
        'shortUrl.totalClicks',
        'shortUrl.uniqueClicks',
        'shortUrl.clickByDate',
        'uniqueOS.osName',
        'uniqueOS.ukClick',
        'uniqueOS.ukUser',
        'uniqueDevices.deviceName',
        'uniqueDevices.ukClick',
        'uniqueDevices.ukUser',
      ])
      .where('shortUrl.emailId = :emailId', { emailId })
      .getMany();

    if (shortUrls.length === 0) {
      throw new NotFoundException('No URLs found for the specified user');
    }

    const totalUrls = shortUrls.length;
    const totalClicks = shortUrls.reduce(
      (sum, url) => sum + url.totalClicks,
      0,
    );
    const uniqueClicks = shortUrls.reduce(
      (sum, url) => sum + url.uniqueClicks,
      0,
    );

    const clicksByDate = shortUrls
      .flatMap((url) => url.clickByDate)
      .reduce((acc, clickEntry) => {
        const existing = acc.find((item) => item.date === clickEntry.date);
        if (existing) {
          existing.click_count += clickEntry.click_count || 0;
        } else {
          acc.push({
            date: clickEntry.date,
            click_count: clickEntry.click_count || 0,
          });
        }
        return acc;
      }, []);

    const osType = shortUrls
      .flatMap((url) => url.uniqueOS)
      .reduce((acc, os) => {
        const existing = acc.find((item) => item.osName === os.osName);
        if (existing) {
          existing.uniqueClicks += os.ukClick;
          existing.uniqueUsers += os.ukUser;
        } else {
          acc.push({
            osName: os.osName,
            uniqueClicks: os.ukClick,
            uniqueUsers: os.ukUser,
          });
        }
        return acc;
      }, []);

    const deviceType = shortUrls
      .flatMap((url) => url.uniqueDevices)
      .reduce((acc, device) => {
        const existing = acc.find(
          (item) => item.deviceName === device.deviceName,
        );
        if (existing) {
          existing.uniqueClicks += device.ukClick;
          existing.uniqueUsers += device.ukUser;
        } else {
          acc.push({
            deviceName: device.deviceName,
            uniqueClicks: device.ukClick,
            uniqueUsers: device.ukUser,
          });
        }
        return acc;
      }, []);
    return {
      totalUrls,
      totalClicks,
      uniqueClicks,
      clicksByDate,
      osType,
      deviceType,
    };
  }
}
