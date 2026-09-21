import React from 'react';

export function CreditCardWidget({ card }) {
  const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-slate-800 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">{card.institution}</span>
          <h4 className="text-lg font-bold">{card.name}</h4>
        </div>
        <span className="text-2xl">💳</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Fatura Atual</span>
          <span className="font-bold text-red-400">{formatBRL(card.currentInvoice)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Limite Disponível</span>
          <span className="font-bold text-emerald-400">{formatBRL(card.availableLimit)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
        <span>Fechamento: Dia {card.closingDay}</span>
        <span>Vencimento: Dia {card.dueDay}</span>
      </div>
    </div>
  );
}