import { MotivationTrendPoint } from './motivation-trend-point.model';

export interface SentimentDashboardData {
  sentimentCounts: { [sentimentLabel: string]: number }; // Map<string, number>
  motivationTrend: MotivationTrendPoint[];
}