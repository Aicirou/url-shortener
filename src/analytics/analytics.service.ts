import { Injectable } from '@nestjs/common';
import { AnalyticsDal } from 'src/dal/analytics.dal';

@Injectable()
export class AnalyticsService {
  constructor(private analyticsDal: AnalyticsDal) {}

  async getAnalyticsForAlias(alias: string) {
    return await this.analyticsDal.getAnalytics(alias);
  }

  async getAnalyticsForTopic(topic: string) {
    return await this.analyticsDal.getAnalyticsByTopic(topic);
  }

  async getOverallAnalytics(emailId: string) {
    return await this.analyticsDal.getOverallAnalytics(emailId);
  }
}
