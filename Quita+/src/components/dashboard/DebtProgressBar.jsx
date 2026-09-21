import React from 'react';

export function DebtProgressBar({ original = 0, paid = 0, remaining = 0 }) {
  const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const percentage = original > 0 ? Math.min(100, Math.round((paid / original) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-gray-800">Progresso de Quitação Geral</h4>
        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{percentage}% Pago</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-3 font-medium">
        <span>Original: {formatBRL(original)}</span>
        <span className="text-emerald-600 font-bold">Pago: {formatBRL(paid)}</span>
        <span className="text-red-500 font-bold">Restante: {formatBRL(remaining)}</span>
      </div>
    </div>
  );
}