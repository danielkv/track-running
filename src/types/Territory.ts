import { Coordinate } from './Run';

export type Territory = {
  id: string; // Unique ID (uuid)
  coordinates: Coordinate[]; // The closed loop polygon
  center: Coordinate; // Centroid for labeling
  ownerId?: string;
  status: 'owned' | 'contested' | 'free';
  area: number; // in square meters
  createdAt: number;
};
