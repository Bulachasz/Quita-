import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';

export default function CalendarPage() {
  const { debts = [] } = useFinancial();
  const [expandedDebtId, setExpandedDebtId] = useState(null);
  const [viewMode, setViewMode] = useState('DEBTS'); // 'DEBTS' ou 'MONTH'
  const [filterStatus, setFilterStatus] = useState('ALL');

  const formatBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  const today = new Date();

  // Processar Dívidas com suas parcelas
  const processedDebts = debts.map((debt) => {
    const totalInst = Number(debt.totalInstallments) || 1;
    const paidInst = Number(debt.paidInstallments) || 0;
    const instAmount = Number(debt.installmentAmount) || 0;
    const baseDueDay = debt.dueDate ? parseInt(debt.dueDate.split('-')[2] || '10') : 10;

    const installments = [];
    let nextDueDate = null;
    let hasOverdue = false;

    for (let i = 1; i <= totalInst; i++) {
      const isPaid = i <= paidInst;
      
      // Projeção simples de data de vencimento mês a mês
      const projectedDate = new Date(today.getFullYear(), today.getMonth() + (i - paidInst - 1), baseDueDay);
      const isOverdue = !isPaid && projectedDate < today;

      if (isOverdue) hasOverdue = true;

      let status = 'Pendente';
      if (isPaid) status = 'Paga';
      else if (isOverdue) status = 'Atrasada';

      if (!isPaid && !nextDueDate) {
        nextDueDate = projectedDate;
      }

      installments.push({
        number: i,
        amount: instAmount,
        dueDate: projectedDate.toLocaleDateString('pt-BR'),
        status,
        isPaid,
        isOverdue
      });
    }

    return {
      ...debt,
      installments,
      nextDueDate: nextDueDate ? nextDueDate.toLocaleDateString('pt-BR') : 'Sem pendências',
      hasOverdue,
      remainingCount: Math.max(0, totalInst - paidInst)
    };
  });

  const toggleExpand = (debtId) => {
    setExpandedDebtId(expandedDebtId === debtId ? null : debtId);
  };

  // Filtrar Dívidas
  const filteredDebts = processedDebts.filter((d) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'Atrasada') return d.hasOverdue;
    if (filterStatus === 'Pendente') return d.remainingCount > 0;
    if (filterStatus === 'Quitada') return d.status === 'Quitada' || d.remainingCount === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800">📅 Agenda & Vencimentos</h2>
          <p className="text-sm text-gray-500">
            Acompanhe o cronograma das suas parcelas de forma organizada por compromisso
          </p>
        </div>

        {/* Alternador de Visão e Filtros */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setViewMode('DEBTS')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'DEBTS' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              📋 Agrupado por Dívida
            </button>
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'MONTH' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              📆 Visão Mensal
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex gap-2 text-xs">
        {[
          { id: 'ALL', label: 'Todas' },
          { id: 'Atrasada', label: '⚠️ Com Atrasos' },
          { id: 'Pendente', label: '⏳ Em Aberto' },
          { id: 'Quitada', label: '✅ Quitas' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-3.5 py-2 rounded-xl font-bold transition border ${
              filterStatus === f.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* VISÃO 1: AGRUPADA POR DÍVIDA (ACCORDION) */}
      {viewMode === 'DEBTS' && (
        <div className="space-y-4">
          {filteredDebts.length > 0 ? (
            filteredDebts.map((debt) => {
              const isExpanded = expandedDebtId === debt.id;
              const remainingAmount = debt.remainingAmount || (debt.remainingCount * debt.installmentAmount);

              return (
                <div
                  key={debt.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:border-gray-200"
                >
                  {/* Cabeçalho do Card da Dívida */}
                  <div
                    onClick={() => toggleExpand(debt.id)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/60 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        debt.hasOverdue
                          ? 'bg-red-100 text-red-600'
                          : debt.remainingCount === 0
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        💳
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-base">{debt.name}</h3>
                          <span className="text-xs text-gray-400 font-medium">({debt.institution || 'Geral'})</span>
                          {debt.hasOverdue && (
                            <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Atraso
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Próximo Vencimento: <strong className="text-gray-700">{debt.nextDueDate}</strong> • Restam {debt.remainingCount} parcelas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 font-medium block">Parcela Mensal</span>
                        <strong className="text-base font-black text-gray-800">
                          {formatBRL(debt.installmentAmount)}
                        </strong>
                      </div>

                      {/* Botão com a Seta de Expansão */}
                      <button
                        type="button"
                        className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200'
                        }`}
                        title={isExpanded ? "Ocultar parcelas" : "Ver todas as parcelas"}
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo Expandido (Lista Interna das Parcelas) */}
                  {isExpanded && (
                    <div className="bg-gray-50/70 border-t border-gray-100 p-5 space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase px-1">
                        <span>Cronograma Individual de Parcelas</span>
                        <span>Saldo nominal restante: {formatBRL(remainingAmount)}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {debt.installments.map((inst) => {
                          const statusBg = inst.isPaid
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : inst.isOverdue
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-white border-gray-200 text-gray-800';

                          return (
                            <div
                              key={inst.number}
                              className={`p-3 rounded-xl border text-xs flex justify-between items-center ${statusBg}`}
                            >
                              <div>
                                <span className="font-bold block">Parcela {inst.number}/{debt.totalInstallments}</span>
                                <span className="opacity-75">{inst.dueDate}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold block">{formatBRL(inst.amount)}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider">
                                  {inst.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
              Nenhuma dívida encontrada para este filtro.
            </div>
          )}
        </div>
      )}

      {/* VISÃO 2: CALENDÁRIO MENSAL */}
      {viewMode === 'MONTH' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-gray-800 text-base">
              Mês de {today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <span className="text-xs text-gray-400">Parcelas previstas para este período</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {processedDebts
              .filter((d) => d.remainingCount > 0)
              .map((d) => (
                <div key={d.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-sm font-bold text-gray-800">{d.name}</strong>
                      <span className="text-xs text-gray-400 block">{d.institution}</span>
                    </div>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Dia {d.dueDate ? d.dueDate.split('-')[2] : '10'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200/60">
                    <span className="text-gray-500">Valor da Parcela:</span>
                    <strong className="text-gray-900 font-bold">{formatBRL(d.installmentAmount)}</strong>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}