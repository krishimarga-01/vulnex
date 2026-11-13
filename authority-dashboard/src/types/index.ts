export * from '@shared/types';

export type LiveConnectionState = 'LIVE' | 'RECONNECTING' | 'OFFLINE' | 'DEMO';

export interface FilterState {
  category: string;
  riskLevel: string;
  region: string;
  search: string;
}
