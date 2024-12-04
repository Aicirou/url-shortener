import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserDal } from './user.dal';
import { ShortUrlDal } from './shortUrl.dal';
import { ShortUrlLogs } from 'src/entities/short_url_logs.entity';
import { ShortUrlUniqueOS } from 'src/entities/short_url_os.entity';
import { ShortUrl } from 'src/entities/short_url.entity';
import { ShortUrlUniqueDevice } from 'src/entities/short_url_device.entity';
import { ShortUrlLogsDal } from './shortUrlLogs.dal';
import { AnalyticsDal } from './analytics.dal';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ShortUrl,
      ShortUrlUniqueOS,
      ShortUrlLogs,
      ShortUrlUniqueDevice,
    ]),
  ],
  providers: [UserDal, ShortUrlDal, ShortUrlLogsDal, AnalyticsDal],
  exports: [UserDal, ShortUrlDal, ShortUrlLogsDal, AnalyticsDal],
})
export class DalModule {}
