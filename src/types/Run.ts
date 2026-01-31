export type Coordinate = {
  latitude: number;
  longitude: number;
  timestamp?: number;
};

export type Run = {
  id: string;
  date: string;
  duration: number; // seconds
  distance: number; // meters
  path: Coordinate[];
  territoryIds: string[];
};
