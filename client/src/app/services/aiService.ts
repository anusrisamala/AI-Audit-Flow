import { api } from './api';

export interface AIRiskResponse {
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  reason: string;
  recommendation: string;
}

export const aiService = {
  async analyzeFinding(data: {
    title: string;
    description: string;
    department: string;
  }): Promise<AIRiskResponse> {
    const response = await api.post('/ai/risk-score', data);
    return response.data;
  },
};