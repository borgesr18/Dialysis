// src/types/index.ts
export interface DialysisRoom {
  id: string; // uuid será uma string
  name: string;
  isolation_type: 'none' | 'hbsag_positive' | 'hcv_positive';
  created_at: string; // timestamptz será uma string
}
