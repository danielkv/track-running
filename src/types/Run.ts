import { Database } from './schema';
export * from './common';

export type RunRow = Database['public']['Tables']['runs']['Row'];
export type RunInsert = Database['public']['Tables']['runs']['Insert'];
export type RunUpdate = Database['public']['Tables']['runs']['Update'];

export type RunDB = RunRow;

export type Run = RunRow;
