
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Shift, DayStats, AnnualBalance } from './types';
import { 
  DAYS_IN_CYCLE, 
  CYCLE_WEEKS,
  FIXED_ROWS_COUNT, 
  MIN_WEEKDAY,
  MIN_WEEKEND,
  SHIFT_HOURS,
  NIGHTS_TO_HOURS_TABLE,
  ANNUAL_BASE_HOURS,
  DAYS_LABELS
} from './constants';
import QuadrantGrid from './components/QuadrantGrid';
import SummaryPanel from './components/SummaryPanel';

const INITIAL_CYCLE: Shift[] = [
  Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.NIGHT, Shift.AFTER_NIGHT, Shift.OFF, Shift.OFF,
  Shift.AFTERNOON, Shift.AFTERNOON, Shift.OFF, Shift.OFF, Shift.MORNING, Shift.MORNING, Shift.MORNING,
  Shift.MORNING, Shift.OFF, Shift.MORNING, Shift.MORNING, Shift.AFTERNOON, Shift.OFF, Shift.NIGHT,
  Shift.AFTER_NIGHT, Shift.OFF, Shift.MORNING, Shift.AFTERNOON, Shift.OFF, Shift.AFTERNOON, Shift.AFTERNOON,
  Shift.OFF, Shift.MORNING, Shift.NIGHT, Shift.AFTER_NIGHT, Shift.OFF, Shift.OFF, Shift.OFF,
  Shift.MORNING, Shift.MORNING, Shift.AFTERNOON, Shift.AFTERNOON, Shift.OFF, Shift.NIGHT, Shift.AFTER_NIGHT,
  Shift.MORNING, Shift.AFTERNOON, Shift.AFTERNOON, Shift.OFF, Shift.MORNING, Shift.MORNING, Shift.MORNING,
  Shift.AFTERNOON, Shift.NIGHT, Shift.AFTER_NIGHT, Shift.OFF, Shift.AFTERNOON, Shift.OFF, Shift.OFF,
  Shift.NIGHT, Shift.AFTER_NIGHT, Shift.OFF, Shift.MORNING, Shift.MORNING, Shift.AFTERNOON, Shift.AFTERNOON,
  Shift.OFF, Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.NIGHT, Shift.AFTER_NIGHT, Shift.OFF
];

const INITIAL_FIXED: Shift[][] = Array(FIXED_ROWS_COUNT).fill(null).map(() => 
  [Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.OFF, Shift.OFF]
);

const App: React.FC = () => {
  const [cycleShifts, setCycleShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('montalvos_2026_cycle_v3');
    return saved ? JSON.parse(saved) : INITIAL_CYCLE;
  });

  const [fixedShifts, setFixedShifts] = useState<Shift[][]>(() => {
    const saved = localStorage.getItem('montalvos_2026_fixed_v3');
    return saved ? JSON.parse(saved) : INITIAL_FIXED;
  });

  useEffect(() => {
    localStorage.setItem('montalvos_2026_cycle_v3', JSON.stringify(cycleShifts));
  }, [cycleShifts]);

  useEffect(() => {
    localStorage.setItem('montalvos_2026_fixed_v3', JSON.stringify(fixedShifts));
  }, [fixedShifts]);

  const handleCycleChange = useCallback((dayIndex: number) => {
    setCycleShifts(prev => {
      const next = [...prev];
      const current = next[dayIndex];
      let nextShift: Shift;
      if (current === Shift.OFF) nextShift = Shift.MORNING;
      else if (current === Shift.MORNING) nextShift = Shift.AFTERNOON;
      else if (current === Shift.AFTERNOON) nextShift = Shift.NIGHT;
      else if (current === Shift.NIGHT) nextShift = Shift.AFTER_NIGHT;
      else nextShift = Shift.OFF;
      next[dayIndex] = nextShift;
      if (nextShift === Shift.NIGHT) {
        const nextIdx = (dayIndex + 1) % DAYS_IN_CYCLE;
        next[nextIdx] = Shift.AFTER_NIGHT;
      }
      return next;
    });
  }, []);

  const handleFixedChange = useCallback((fixedIdx: number, dayIdx: number) => {
    setFixedShifts(prev => {
      const next = [...prev];
      const row = [...next[fixedIdx]];
      const current = row[dayIdx];
      let nextShift: Shift;
      if (current === Shift.OFF) nextShift = Shift.MORNING;
      else if (current === Shift.MORNING) nextShift = Shift.AFTERNOON;
      else if (current === Shift.AFTERNOON) nextShift = Shift.NIGHT;
      else if (current === Shift.NIGHT) nextShift = Shift.AFTER_NIGHT;
      else nextShift = Shift.OFF;
      row[dayIdx] = nextShift;
      if (nextShift === Shift.NIGHT) {
        const nextDayIdx = (dayIdx + 1) % 7;
        row[nextDayIdx] = Shift.AFTER_NIGHT;
      }
      next[fixedIdx] = row;
      return next;
    });
  }, []);

  const handleReset = () => {
    if (confirm("¿Restablecer al cuadrante base rellenado?")) {
      setCycleShifts(INITIAL_CYCLE);
      setFixedShifts(INITIAL_FIXED);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const annualBalance = useMemo((): AnnualBalance => {
    let totalHours = 0;
    let nightsInCycle = 0;
    cycleShifts.forEach(s => {
      totalHours += SHIFT_HOURS[s];
      if (s === Shift.NIGHT) nightsInCycle++;
    });
    const extrapolationFactor = 365 / DAYS_IN_CYCLE;
    const annualWorked = totalHours * extrapolationFactor;
    const annualNights = nightsInCycle * extrapolationFactor;
    const roundedNights = Math.round(annualNights);
    const weightedRequired = NIGHTS_TO_HOURS_TABLE[roundedNights] || NIGHTS_TO_HOURS_TABLE[38] || ANNUAL_BASE_HOURS;
    return {
      workedHours: annualWorked,
      weightedRequired,
      balance: annualWorked - weightedRequired,
      nightsCount: annualNights
    };
  }, [cycleShifts]);

  const handleExportExcel = () => {
    let csv = "FASE;LUNES;MARTES;MIERCOLES;JUEVES;VIERNES;SABADO;DOMINGO\n";
    for (let w = 0; w < CYCLE_WEEKS; w++) {
      const weekShifts = cycleShifts.slice(w * 7, (w + 1) * 7).join(';');
      csv += `SEMANA ${w + 1};${weekShifts}\n`;
    }
    csv += "\nPERSONAL FIJO\n";
    fixedShifts.forEach((row, i) => {
      csv += `FIJO ${i + 1};${row.join(';')}\n`;
    });

    csv += "\nRESULTADOS DE JORNADA ANUAL\n";
    csv += `Jornada Tabla (Ponderada);${Math.round(annualBalance.weightedRequired)}h\n`;
    csv += `Horas Ciclo (Extrapoladas);${Math.round(annualBalance.workedHours)}h\n`;
    csv += `Noches/Año;${annualBalance.nightsCount.toFixed(1)}\n`;
    csv += `Balance Final;${annualBalance.balance.toFixed(1)}h\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Cuadrante_Montalvos_2026.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dailyStats = useMemo(() => {
    return Array(7).fill(null).map((_, dayOfWeek) => {
      let m = 0, t = 0, n = 0;
      for (let week = 0; week < CYCLE_WEEKS; week++) {
        const shift = cycleShifts[week * 7 + dayOfWeek];
        if (shift === Shift.MORNING) m += 2;
        if (shift === Shift.AFTERNOON) t += 2;
        if (shift === Shift.NIGHT) n += 2;
      }
      fixedShifts.forEach(row => {
        const shift = row[dayOfWeek];
        if (shift === Shift.MORNING) m += 1;
        if (shift === Shift.AFTERNOON) t += 1;
        if (shift === Shift.NIGHT) n += 1;
      });
      const isWeekend = dayOfWeek >= 5;
      const mins = isWeekend ? MIN_WEEKEND : MIN_WEEKDAY;
      const isMinMet = m >= mins.M && t >= mins.T && n >= mins.N;
      return { morning: m, afternoon: t, night: n, isMinMet };
    });
  }, [cycleShifts, fixedShifts]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0 z-50 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 px-2.5 py-1 rounded text-white font-black text-xl italic tracking-tighter">UGT</div>
          <div>
            <h1 className="text-sm font-black text-slate-800 leading-none uppercase tracking-tight">CELADORES LOS MONTALVOS 2026</h1>
            <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-0.5">Planificador de Rotaciones</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded shadow-sm transition-all uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black rounded shadow-sm transition-all uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            PDF / Imprimir
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button onClick={handleReset} className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded border border-slate-200 transition-all" title="Resetear">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden mobile-order-swap">
        <div className="grid-container flex-1 overflow-hidden flex flex-col">
          <QuadrantGrid 
            cycleShifts={cycleShifts}
            fixedShifts={fixedShifts}
            dailyStats={dailyStats}
            onCycleChange={handleCycleChange}
            onFixedChange={handleFixedChange}
            annualBalance={annualBalance.balance}
          />
        </div>

        <div className="summary-container p-4 bg-slate-100 border-t border-slate-200 no-print">
          <SummaryPanel 
            totalWorked={annualBalance.workedHours}
            totalNights={annualBalance.nightsCount}
            weightedRequired={annualBalance.weightedRequired}
            balance={annualBalance.balance}
          />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-3 flex-shrink-0 text-center md:text-left no-print">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="text-[10px] leading-tight">
            <span className="text-red-600 font-black block md:inline uppercase">Aviso UGT: </span>
            <span className="text-slate-500 font-bold italic">Cálculo basado en jornada ponderada según noches reales.</span>
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase text-slate-400 items-center">
            <span className="text-blue-500">M:7h</span>
            <span className="text-amber-500">T:7h</span>
            <span className="text-indigo-900">N:10h</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
