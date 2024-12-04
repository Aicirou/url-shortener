import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GoogleAuthGuard } from 'src/common/guard/jwt.guard';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(GoogleAuthGuard)
  @Get('api/analytics/:alias')
  async getAnalyticsByAlias(@Param('alias') alias: string) {
    return this.analyticsService.getAnalyticsForAlias(alias);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('api/analytics/topic/:topic')
  async getAnalyticsByTopic(@Param('topic') topic: string) {
    return this.analyticsService.getAnalyticsForTopic(topic);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('api/overall-analytics')
  async getOverallAnalytics(@Req() req: any) {
    return this.analyticsService.getOverallAnalytics(req.user.email);
  }
}
