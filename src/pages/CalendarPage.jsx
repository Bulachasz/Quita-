import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';

export default function CalendarPage() {
  const { debts = [] } = useFinancial();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const formatBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  // Mapear todas as parcelas ativas de todas as dívidas para uma lista unificada de calendário
  const allInstallments = [];
  const today = new Date();

  debts.forEach((debt) => {
    const totalInst = Number(debt.totalInstallments) || 1;
    const paidInst = Number(debt.paidInstallments) || 0;
    const instAmount = Number(debt.installmentAmount) || 0;
    const baseDueDay = debt.dueDate ? parseInt(debt.dueDate.split('-')[2] || '10') : 10;

    for (let i = 1; i <= totalInst; i++) {
      const isPaid = i <= paidInst;
      
      // Projetar data aproximada para cada parcela
      const projectedDate = new Date(today.getFullYear(), today.getMonth() + (i - paidInst - 1), baseDueDay);
      const isOverdue = !isPaid && projectedDate < today;

      let status = 'Pendente';
      if (isPaid) status = 'Paga';
      else if (isOverdue) status = 'Atrasada';

      allInstallments.push({
        id: `${debt.id}-inst-${i}`,
        debtName: debt.name,
        institution: debt.institution,
        installmentNumber: i,
        totalInstallments: totalInst,
        amount: instAmount,
        dueDate: projectedDate.toLocaleDateString('pt-BR'),
        status,
        rawDate: projectedDate
      });
    }
  });

  // Filtragem
  const filteredList = allInstallments.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">📅 Calendário de Vencimentos</h2>
          <p className="text-sm text-gray-500">
            Acompanhe o cronograma de pagamento de cada parcela no tempo
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 text-xs">
          {['ALL', 'Pendente', 'Atrasada', 'Paga'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {st === 'ALL' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Compromissos da Agenda */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
        {filteredList.length > 0 ? (
          filteredList.slice(0, 15).map((item) => {
            const statusStyles = {
              Paga: 'bg-emerald-50 border-emerald-200 text-emerald-800',
              Atrasada: 'bg-red-50 border-red-200 text-red-800',
              Pendente: 'bg-amber-50 border-amber-200 text-amber-800'
            };

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex justify-between items-center text-sm font-medium transition ${
                  statusStyles[item.status] || 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-base">{item.debtName}</strong>
                    <span className="text-xs opacity-75 font-normal">({item.institution})</span>
                  </div>
                  <p className="text-xs opacity-80">
                    Parcela {item.installmentNumber}/{item.totalInstallments} • Previsão de Vencimento: {item.dueDate}
                  </p>
                </div>

                <div className="text-right">
                  <strong className="font-black text-lg block">{formatBRL(item.amount)}</strong>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-white/70 shadow-xs">
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            Nenhuma parcela encontrada para este filtro.
          </div>
        )}
      </div>
    </div>
  );
}