
export enum Shift {
  MORNING = 'M',
  AFTERNOON = 'T',
  NIGHT = 'N',
  OFF = 'D',
  AFTER_NIGHT = '/'
}

export type RowType = 'PAIR' | 'FIXED';

export interface StaffRow {
  id: string;
  name: string;
  type: RowType;
  shifts: Shift[]; // 70 elements
}

export interface DayStats {
  morning: number;
  afternoon: number;
  night: number;
  isMinMet: boolean;
}

export interface AnnualBalance {
  workedHours: number;
  weightedRequired: number;
  balance: number;
  nightsCount: number;
}
