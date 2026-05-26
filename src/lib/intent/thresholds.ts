import thresholdConfig from '../../config/intentThresholds.json';

export interface IntentThresholdConfig {
  minAreaEntityCount: number;
  minCategoryAreaCount: number;
  categoryMinMatches: Record<string, number>;
}

export const intentThresholds: IntentThresholdConfig = {
  minAreaEntityCount: thresholdConfig.minAreaEntityCount,
  minCategoryAreaCount: thresholdConfig.minCategoryAreaCount,
  categoryMinMatches: thresholdConfig.categoryMinMatches,
};
