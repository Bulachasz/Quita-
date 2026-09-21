import React from 'react';

export function MetricsOverview({ metrics }) {
  const formatBRL = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const cards = [
    { label: 'Total das Dívidas', value: formatBRL(metrics.totalDebt), color: 'border-red-500 text-red-600', icon: '🔻' },
    { label: 'Total Já Pago', value: formatBRL(metrics.totalPaid), color: 'border-emerald-500 text-emerald-600', icon: '✅' },
    { label: 'Parcelas Mensais', value: formatBRL(metrics.monthlyCommitment), color: 'border-indigo-500 text-indigo-600', icon: '📅' },
    { label: 'Qtd. de Dívidas', value: metrics.debtCount || 0, color: 'border-amber-500 text-amber-600', icon: '📋' },
    { label: 'Renda Disponível', value: formatBRL(metrics.availableIncome), color: 'border-blue-500 text-blue-600', icon: '💵' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${card.color} border-y border-r border-gray-100`}>
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
            <span>{card.label}</span>
            <span>{card.icon}</span>
          </div>
          <p className="text-xl font-black text-gray-800 mt-2 tracking-tight">{card.value}</p>
        </div>
      ))}
    </div>
  );
}