import { Database } from './schema';
export * from './common';

export type RunRow = Database['public']['Tables']['runs']['Row'];
export type RunInsert = Database['public']['Tables']['runs']['Insert'];
export type RunUpdate = Database['public']['Tables']['runs']['Update'];

export type RunDB = RunRow;

export type Run = RunRow;

export type RouteRow = Database['public']['Tables']['routes']['Row'];
export type RouteInsert = Database['public']['Tables']['routes']['Insert'];
export type RouteUpdate = Database['public']['Tables']['routes']['Update'];

export type Route = RouteRow;
