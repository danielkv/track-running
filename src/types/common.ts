export type Coordinate = {
  latitude: number;
  longitude: number;
  timestamp: number;
  elevation?: number;
  speed?: number;
};

export type RunStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export type RunMetadata = {
  averageSpeed?: number;
  maxSpeed?: number;
  elevationGain?: number;
  calories?: number;
  [key: string]: unknown;
};
