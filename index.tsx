
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- TIPOS ---
enum Shift {
  MORNING = 'M',
  AFTERNOON = 'T',
  NIGHT = 'N',
  OFF = 'D',
  AFTER_NIGHT = '/'
}

interface AnnualBalance {
  workedHours: number;
  weightedRequired: number;
  balance: number;
  nightsCount: number;
}

// --- CONSTANTES ---
const CYCLE_WEEKS = 10;
const DAYS_IN_CYCLE = 70;
const FIXED_ROWS_COUNT = 3;
const ANNUAL_BASE_HOURS = 1530;

const NIGHTS_TO_HOURS_TABLE: Record<number, number> = {
  0: 1530, 1: 1529, 2: 1525, 3: 1528, 4: 1524, 5: 1527, 6: 1523, 7: 1526, 8: 1522, 9: 1525,
  10: 1521, 11: 1517, 12: 1520, 13: 1516, 14: 1519, 15: 1515, 16: 1518, 17: 1514, 18: 1517, 19: 1513,
  20: 1516, 21: 1512, 22: 1508, 23: 1511, 24: 1507, 25: 1510, 26: 1506, 27: 1509, 28: 1505, 29: 1508,
  30: 1504, 31: 1507, 32: 1503, 33: 1499, 34: 1502, 35: 1498, 36: 1501, 37: 1497, 38: 1500
};

const SHIFT_HOURS = {
  [Shift.MORNING]: 7,
  [Shift.AFTERNOON]: 7,
  [Shift.NIGHT]: 10,
  [Shift.OFF]: 0,
  [Shift.AFTER_NIGHT]: 0
};

const SHIFT_COLORS = {
  [Shift.MORNING]: 'bg-blue-100 text-blue-700 border-blue-200',
  [Shift.AFTERNOON]: 'bg-amber-100 text-amber-700 border-amber-200',
  [Shift.NIGHT]: 'bg-indigo-900 text-white border-indigo-950',
  [Shift.OFF]: 'bg-slate-100 text-slate-400 border-slate-200',
  [Shift.AFTER_NIGHT]: 'bg-emerald-50 text-emerald-600 border-emerald-200'
};

const MIN_WEEKDAY = { M: 10, T: 4, N: 2 };
const MIN_WEEKEND = { M: 4, T: 4, N: 2 };
const DAYS_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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

// --- COMPONENTES ---

const SummaryPanel = ({ workedHours, nightsCount, weightedRequired, balance }: AnnualBalance) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-5xl mx-auto w-full">
    <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-center">
      <p className="text-[7px] font-black text-slate-500 uppercase leading-none mb-1 tracking-wider">Jornada Tabla</p>
      <p className="text-base font-black text-white leading-none">{Math.round(weightedRequired)}h</p>
    </div>
    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
      <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-1 tracking-wider">Horas Ciclo</p>
      <p className="text-base font-black text-blue-600 leading-none">{Math.round(workedHours)}h</p>
    </div>
    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
      <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-1 tracking-wider">Noches/Año</p>
      <p className="text-base font-black text-indigo-900 leading-none">{nightsCount.toFixed(1)}</p>
    </div>
    <div className={`p-2 rounded-lg border shadow-sm flex flex-col justify-center ${balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <p className="text-[7px] font-black text-slate-500 uppercase leading-none mb-1 tracking-wider">Balance Final</p>
      <p className={`text-base font-black leading-none ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{balance > 0 ? '+' : ''}{balance.toFixed(1)}h</p>
    </div>
  </div>
);

const App = () => {
  const [cycleShifts, setCycleShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('montalvos_v6');
    return saved ? JSON.parse(saved) : INITIAL_CYCLE;
  });

  const [fixedShifts, setFixedShifts] = useState<Shift[][]>(() => {
    const saved = localStorage.getItem('montalvos_fixed_v6');
    return saved ? JSON.parse(saved) : INITIAL_FIXED;
  });

  useEffect(() => {
    localStorage.setItem('montalvos_v6', JSON.stringify(cycleShifts));
    localStorage.setItem('montalvos_fixed_v6', JSON.stringify(fixedShifts));
  }, [cycleShifts, fixedShifts]);

  const handleCycleChange = (idx: number) => {
    const next = [...cycleShifts];
    const sequence = [Shift.OFF, Shift.MORNING, Shift.AFTERNOON, Shift.NIGHT, Shift.AFTER_NIGHT];
    const currentIdx = sequence.indexOf(next[idx]);
    const nextShift = sequence[(currentIdx + 1) % sequence.length];
    next[idx] = nextShift;
    if (nextShift === Shift.NIGHT) {
      const nextIdx = (idx + 1) % DAYS_IN_CYCLE;
      next[nextIdx] = Shift.AFTER_NIGHT;
    }
    setCycleShifts(next);
  };

  const handleFixedChange = (rowIdx: number, colIdx: number) => {
    const next = [...fixedShifts];
    const row = [...next[rowIdx]];
    const sequence = [Shift.OFF, Shift.MORNING, Shift.AFTERNOON, Shift.NIGHT, Shift.AFTER_NIGHT];
    const currentIdx = sequence.indexOf(row[colIdx]);
    const nextShift = sequence[(currentIdx + 1) % sequence.length];
    row[colIdx] = nextShift;
    if (nextShift === Shift.NIGHT) {
      const nextColIdx = (colIdx + 1) % 7;
      row[nextColIdx] = Shift.AFTER_NIGHT;
    }
    next[rowIdx] = row;
    setFixedShifts(next);
  };

  const annualBalance = useMemo((): AnnualBalance => {
    let hours = 0, nights = 0;
    cycleShifts.forEach(s => { 
        hours += SHIFT_HOURS[s]; 
        if (s === Shift.NIGHT) nights++; 
    });
    const factor = 365 / DAYS_IN_CYCLE;
    const annWorked = hours * factor;
    const annNights = nights * factor;
    const req = NIGHTS_TO_HOURS_TABLE[Math.round(annNights)] || ANNUAL_BASE_HOURS;
    return { workedHours: annWorked, weightedRequired: req, balance: annWorked - req, nightsCount: annNights };
  }, [cycleShifts]);

  const dailyStats = useMemo(() => {
    return Array(7).fill(0).map((_, d) => {
      let m = 0, t = 0, n = 0;
      for (let w = 0; w < CYCLE_WEEKS; w++) {
        const s = cycleShifts[w * 7 + d];
        if (s === Shift.MORNING) m += 2; else if (s === Shift.AFTERNOON) t += 2; else if (s === Shift.NIGHT) n += 2;
      }
      fixedShifts.forEach(r => {
        const s = r[d];
        if (s === Shift.MORNING) m++; else if (s === Shift.AFTERNOON) t++; else if (s === Shift.NIGHT) n++;
      });
      const mins = d >= 5 ? MIN_WEEKEND : MIN_WEEKDAY;
      return { morning: m, afternoon: t, night: n, isMinMet: m >= mins.M && t >= mins.T && n >= mins.N };
    });
  }, [cycleShifts, fixedShifts]);

  const exportExcel = () => {
    let csv = "FASE;L;M;X;J;V;S;D\n";
    for (let w = 0; w < CYCLE_WEEKS; w++) csv += `S.${w+1};${cycleShifts.slice(w*7, (w+1)*7).join(';')}\n`;
    csv += "\nFIJOS\n";
    fixedShifts.forEach((r, i) => csv += `F.${i+1};${r.join(';')}\n`);
    csv += `\nRESUMEN ANUAL\n`;
    csv += `Jornada Tabla;${Math.round(annualBalance.weightedRequired)}h\n`;
    csv += `Horas Ciclo;${Math.round(annualBalance.workedHours)}h\n`;
    csv += `Noches/Año;${annualBalance.nightsCount.toFixed(1)}\n`;
    csv += `Balance;${annualBalance.balance.toFixed(1)}h\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "Cuadrante_Montalvos_2026.csv"; link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm no-print">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 px-2 py-0.5 rounded text-white font-black text-lg italic tracking-tighter">UGT</div>
          <h1 className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none">MONTALVOS 2026</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="px-2.5 py-1 bg-green-600 text-white text-[10px] font-bold rounded uppercase">Excel</button>
          <button onClick={() => window.print()} className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded uppercase">PDF</button>
          <button onClick={() => confirm("¿Resetear?") && (setCycleShifts(INITIAL_CYCLE), setFixedShifts(INITIAL_FIXED))} className="p-1 text-slate-300 hover:text-red-500 transition-colors">↺</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden mobile-order-swap">
        <div className="grid-container flex-1 overflow-auto bg-white shadow-inner">
          <table className="w-full border-separate border-spacing-0 text-[10px] table-fixed">
            <thead className="bg-slate-100">
              <tr>
                <th className="w-12 p-1 border-b border-r border-slate-300 text-slate-400 sticky left-0 bg-slate-100 z-50 text-[7px] uppercase">Fase</th>
                {DAYS_LABELS.map(d => <th key={d} className="p-1 border-b border-r border-slate-200 uppercase font-black text-slate-600">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: CYCLE_WEEKS }).map((_, w) => (
                <tr key={w}>
                  <td className="p-1 border-b border-r border-slate-200 font-bold text-slate-400 sticky left-0 bg-slate-50 z-20 text-center">S.{w + 1}</td>
                  {Array.from({ length: 7 }).map((_, d) => {
                    const shift = cycleShifts[w * 7 + d];
                    return (
                      <td key={d} onClick={() => handleCycleChange(w * 7 + d)} className={`p-0 border-b border-r border-slate-100 cursor-pointer select-none ${SHIFT_COLORS[shift]}`}>
                        <div className="h-8 flex items-center justify-center font-black text-xs cell-transition">{shift}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-amber-50">
                <td colSpan={8} className="p-0.5 text-[7px] font-black uppercase text-amber-600 px-2 tracking-widest border-b border-amber-200">Personal Fijo</td>
              </tr>
              {fixedShifts.map((r, ri) => (
                <tr key={ri}>
                  <td className="p-1 border-b border-r border-amber-200 font-bold text-amber-800 sticky left-0 bg-amber-50 z-20 text-center">F.{ri + 1}</td>
                  {r.map((s, di) => (
                    <td key={di} onClick={() => handleFixedChange(ri, di)} className={`p-0 border-b border-r border-amber-100 cursor-pointer select-none ${SHIFT_COLORS[s]}`}>
                      <div className="h-8 flex items-center justify-center font-black text-xs cell-transition">{s}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 z-50 shadow-[0_-4px_6px_rgba(0,0,0,0.05)] bg-white">
              {['M', 'T', 'N'].map((type, idx) => (
                <tr key={type} className="border-t border-slate-200">
                  <td className="p-0.5 text-center font-black text-[8px] text-slate-400 bg-slate-50 border-r border-slate-200">{type}</td>
                  {dailyStats.map((s, i) => (
                    <td key={i} className={`text-center font-black text-[10px] border-r border-slate-100 ${idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-amber-600' : 'text-indigo-900'}`}>
                      {idx === 0 ? s.morning : idx === 1 ? s.afternoon : s.night}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-900 text-white">
                <td className="p-1 text-center text-[7px] font-black border-r border-slate-700 uppercase">Estado</td>
                {dailyStats.map((s, i) => (
                  <td key={i} className={`text-center font-bold text-sm border-r border-slate-800 ${s.isMinMet ? 'text-green-400' : 'text-red-500 bg-red-950/20'}`}>
                    {s.isMinMet ? '✓' : '!'}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="summary-container p-3 bg-slate-100 border-t border-slate-200 no-print">
          <SummaryPanel {...annualBalance} />
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200 p-2 text-center no-print">
         <p className="text-[9px] font-bold text-slate-400 uppercase italic">© UGT Los Montalvos - Cálculo de Jornada Ponderada SACYL 2026</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
