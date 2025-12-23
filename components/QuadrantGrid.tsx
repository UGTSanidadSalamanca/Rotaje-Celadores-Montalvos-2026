
import React from 'react';
import { Shift, DayStats } from '../types';
import { DAYS_LABELS, SHIFT_COLORS, CYCLE_WEEKS } from '../constants';

interface QuadrantGridProps {
  cycleShifts: Shift[];
  fixedShifts: Shift[][];
  dailyStats: DayStats[];
  onCycleChange: (dayIndex: number) => void;
  onFixedChange: (fixedIdx: number, dayIdx: number) => void;
  annualBalance: number;
}

const QuadrantGrid: React.FC<QuadrantGridProps> = ({ 
  cycleShifts, 
  fixedShifts, 
  dailyStats, 
  onCycleChange,
  onFixedChange,
  annualBalance
}) => {
  return (
    <div className="flex-1 overflow-auto relative bg-white border-b border-slate-200 shadow-inner">
      <table className="w-full border-separate border-spacing-0 text-xs table-fixed">
        <thead>
          <tr className="bg-slate-100">
            <th className="sticky top-0 left-0 z-50 px-2 py-2 text-left font-black text-slate-500 border-b border-r border-slate-300 bg-slate-100 w-[60px] uppercase text-[7px] leading-tight">
              Fase<br/>Ciclo
            </th>
            {DAYS_LABELS.map((label, i) => (
              <th key={label} className={`sticky top-0 z-40 px-0.5 py-2 text-center font-black border-b border-r border-slate-200 transition-colors uppercase text-[8px] ${i >= 5 ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-slate-100'}`}>
                {label.substring(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {/* PAREJAS CICLO */}
          {Array.from({ length: CYCLE_WEEKS }).map((_, weekIdx) => (
            <tr key={`week-${weekIdx}`} className="group">
              <td className="sticky left-0 px-2 py-1 border-b border-r border-slate-200 font-bold text-slate-400 bg-slate-50 group-hover:bg-slate-100 transition-colors z-20 text-[8px]">
                S.{weekIdx + 1}
              </td>
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const globalIdx = weekIdx * 7 + dayIdx;
                const shift = cycleShifts[globalIdx];
                return (
                  <td 
                    key={dayIdx} 
                    onClick={() => onCycleChange(globalIdx)}
                    className="p-0 border-b border-r border-slate-100 cursor-pointer select-none"
                  >
                    <div className={`w-full h-8 flex items-center justify-center font-black text-xs cell-transition ${SHIFT_COLORS[shift]}`}>
                      {shift}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}

          {/* SEPARADOR FIJOS */}
          <tr className="bg-amber-50">
            <td colSpan={8} className="px-2 py-0.5 text-[7px] font-black uppercase text-amber-600 tracking-widest border-b border-amber-200 leading-none">
              Fijos
            </td>
          </tr>
          
          {fixedShifts.map((shifts, fIdx) => (
            <tr key={`fixed-${fIdx}`} className="group">
              <td className="sticky left-0 px-2 py-1 border-b border-r border-amber-200 font-bold text-amber-800 bg-amber-50 z-20 text-[8px]">
                F.{fIdx + 1}
              </td>
              {shifts.map((shift, dayIdx) => (
                <td 
                  key={dayIdx} 
                  onClick={() => onFixedChange(fIdx, dayIdx)}
                  className="p-0 border-b border-r border-amber-100 cursor-pointer select-none"
                >
                  <div className={`w-full h-8 flex items-center justify-center font-black text-xs cell-transition ${SHIFT_COLORS[shift]}`}>
                    {shift}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {/* RECUENTO DIARIO COMPACTO */}
        <tfoot className="sticky bottom-0 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
          <tr className="bg-white border-t border-slate-300">
            <td className="sticky left-0 py-0.5 px-2 font-black uppercase text-[7px] bg-slate-50 border-r border-slate-300 text-slate-500 z-50 leading-none">
               M
            </td>
            {dailyStats.map((s, i) => (
              <td key={i} className="py-0.5 text-center font-black text-blue-600 border-r border-slate-200 bg-white text-[10px]">
                {s.morning}
              </td>
            ))}
          </tr>
          <tr className="bg-white border-t border-slate-100">
            <td className="sticky left-0 py-0.5 px-2 font-black uppercase text-[7px] bg-slate-50 border-r border-slate-300 text-slate-500 z-50 leading-none">
               T
            </td>
            {dailyStats.map((s, i) => (
              <td key={i} className="py-0.5 text-center font-black text-amber-600 border-r border-slate-200 bg-white text-[10px]">
                {s.afternoon}
              </td>
            ))}
          </tr>
          <tr className="bg-white border-t border-slate-100">
            <td className="sticky left-0 py-0.5 px-2 font-black uppercase text-[7px] bg-slate-50 border-r border-slate-300 text-slate-500 z-50 leading-none">
               N
            </td>
            {dailyStats.map((s, i) => (
              <td key={i} className="py-0.5 text-center font-black text-indigo-900 border-r border-slate-200 bg-white text-[10px]">
                {s.night}
              </td>
            ))}
          </tr>
          <tr className="bg-slate-900 text-white">
            <td className="sticky left-0 py-1 px-2 font-black uppercase text-[7px] bg-slate-900 border-r border-slate-700 z-50 leading-none">
              MÍN
            </td>
            {dailyStats.map((s, i) => (
              <td key={i} className={`py-1 text-center font-black text-sm border-r border-slate-700 ${s.isMinMet ? 'text-green-400' : 'text-red-500 bg-red-950/40 animate-pulse'}`}>
                {s.isMinMet ? '✓' : '!'}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default QuadrantGrid;
