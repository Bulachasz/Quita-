import React from 'react';

export function MetricsOverview({ metrics }) {
  const formatBRL = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const income = metrics?.income || 0;
  const expenses = metrics?.expenses || 0;
  const monthlyCommitment = metrics?.monthlyCommitment || 0;
  const availableIncome = metrics?.availableIncome || (income - expenses - monthlyCommitment);

  const cards = [
    { label: 'Total das Dívidas', value: formatBRL(metrics.totalDebt), color: 'border-red-500 text-red-600', icon: '🔻' },
    { label: 'Total Já Pago', value: formatBRL(metrics.totalPaid), color: 'border-emerald-500 text-emerald-600', icon: '✅' },
    { label: 'Parcelas Mensais', value: formatBRL(monthlyCommitment), color: 'border-indigo-500 text-indigo-600', icon: '📅' },
    { label: 'Qtd. de Dívidas', value: metrics.debtCount || 0, color: 'border-amber-500 text-amber-600', icon: '📋' },
    { label: 'Renda Disponível', value: formatBRL(availableIncome), color: 'border-emerald-600 text-emerald-600', icon: '💵' },
  ];

  return (
    <div className="space-y-4">
      {/* 5 Cards Principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-2xl p-4 shadow-xs border-l-4 ${card.color} border-y border-r border-gray-100`}>
            <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
              <span>{card.label}</span>
              <span>{card.icon}</span>
            </div>
            <p className="text-xl font-black text-gray-800 mt-2 tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Card Explicativo: Relação Ganhou x Gastou x Sobrou */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="text-base">📊</span>
          <span className="font-bold">Resumo do Orçamento Mensal:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600">
          <div>
            <span>(+) Renda: </span>
            <strong className="text-emerald-600 font-bold">{formatBRL(income)}</strong>
          </div>
          <div>
            <span>(-) Despesas Fixas: </span>
            <strong className="text-red-500 font-bold">{formatBRL(expenses)}</strong>
          </div>
          <div>
            <span>(-) Dívidas: </span>
            <strong className="text-indigo-600 font-bold">{formatBRL(monthlyCommitment)}</strong>
          </div>
          <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <span>(=) Sobra Livre: </span>
            <strong className={`font-black ${availableIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatBRL(availableIncome)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}