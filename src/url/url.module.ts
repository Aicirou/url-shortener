import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { DalModule } from 'src/dal/dal.module';
import { RateLimitService } from 'src/common/service/rate-limiting.service';

@Module({
  imports: [DalModule],
  providers: [UrlService, RateLimitService],
  controllers: [UrlController]
})
export class UrlModule {}
