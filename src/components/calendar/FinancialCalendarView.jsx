import React from 'react';

export function FinancialCalendarView({ installments = [] }) {
  const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
      <h3 className="font-bold text-gray-800">Próximos Vencimentos</h3>
      
      <div className="space-y-2">
        {installments.map((item, i) => {
          const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'Paga';
          return (
            <div
              key={i}
              className={`p-3.5 rounded-xl border flex justify-between items-center text-sm font-medium ${
                item.status === 'Paga'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isOverdue
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div>
                <p className="font-bold">{item.debtName}</p>
                <p className="text-xs opacity-75">Vencimento: {item.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-base">{formatBRL(item.amount)}</p>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/60">
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}