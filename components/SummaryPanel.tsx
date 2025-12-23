
import React from 'react';

interface SummaryPanelProps {
  totalWorked: number;
  totalNights: number;
  weightedRequired: number;
  balance: number;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ totalWorked, totalNights, weightedRequired, balance }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-5xl mx-auto w-full">
      <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-center">
        <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Jornada Tabla</p>
        <p className="text-base font-black text-white leading-none">{Math.round(weightedRequired)}h</p>
      </div>
      
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Horas Ciclo</p>
        <p className="text-base font-black text-blue-600 leading-none">{Math.round(totalWorked)}h</p>
      </div>

      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Noches/Año</p>
        <p className="text-base font-black text-indigo-900 leading-none">{totalNights.toFixed(1)}</p>
      </div>

      <div className={`p-2 rounded-lg border shadow-sm flex flex-col justify-center ${
        balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Balance Final</p>
        <p className={`text-base font-black leading-none ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {balance > 0 ? '+' : ''}{balance.toFixed(1)}h
        </p>
      </div>
    </div>
  );
};

export default SummaryPanel;
