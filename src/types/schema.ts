import { MergeDeep } from 'type-fest';
import { Coordinate, RunMetadata, RunStatus } from './common';
import { Database as DatabaseGenerated } from './supabase';

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        runs: {
          Row: {
            path: Coordinate[];
            metadata: RunMetadata;
            status: RunStatus;
          };
          Insert: {
            path?: Coordinate[];
            metadata?: RunMetadata;
            status?: RunStatus;
          };
          Update: {
            path?: Coordinate[];
            metadata?: RunMetadata;
            status?: RunStatus;
          };
        };
        routes: {
             Row: {
                path: Coordinate[];
             };
             Insert: {
                path?: Coordinate[];
             };
             Update: {
                path?: Coordinate[];
             };
        }
      };
    };
  }
>;
