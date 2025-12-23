
import { Shift } from './types';

export const CYCLE_WEEKS = 10;
export const DAYS_IN_CYCLE = 70; // 10 semanas * 7 días
export const PAIR_ROWS_COUNT = 10;
export const FIXED_ROWS_COUNT = 3;

// SACYL 2025/2026 Logic
export const ANNUAL_BASE_HOURS = 1530;

// Tabla proporcionada por el usuario: Noches -> Horas a Realizar
export const NIGHTS_TO_HOURS_TABLE: Record<number, number> = {
  0: 1530, 1: 1529, 2: 1525, 3: 1528, 4: 1524, 5: 1527, 6: 1523, 7: 1526, 8: 1522, 9: 1525,
  10: 1521, 11: 1517, 12: 1520, 13: 1516, 14: 1519, 15: 1515, 16: 1518, 17: 1514, 18: 1517, 19: 1513,
  20: 1516, 21: 1512, 22: 1508, 23: 1511, 24: 1507, 25: 1510, 26: 1506, 27: 1509, 28: 1505, 29: 1508,
  30: 1504, 31: 1507, 32: 1503, 33: 1499, 34: 1502, 35: 1498, 36: 1501, 37: 1497, 38: 1500
};

export const SHIFT_HOURS = {
  [Shift.MORNING]: 7,
  [Shift.AFTERNOON]: 7,
  [Shift.NIGHT]: 10,
  [Shift.OFF]: 0,
  [Shift.AFTER_NIGHT]: 0
};

// Mínimos diarios - Ajustados para Celadores Los Montalvos
export const MIN_WEEKDAY = { M: 10, T: 4, N: 2 };
export const MIN_WEEKEND = { M: 4, T: 4, N: 2 };

export const DAYS_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const SHIFT_COLORS = {
  [Shift.MORNING]: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  [Shift.AFTERNOON]: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
  [Shift.NIGHT]: 'bg-indigo-900 text-white border-indigo-950 hover:bg-indigo-800',
  [Shift.OFF]: 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200',
  [Shift.AFTER_NIGHT]: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
};
