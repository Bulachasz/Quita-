import React, { useRef } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Button } from '../components/common/Button';

export default function ReportsPage() {
  const { debts = [], metrics, history = [], budget } = useFinancial();
  const printRef = useRef();

  const formatBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  const activeDebts = debts.filter((d) => d.status !== 'Quitada');
  const paidDebts = debts.filter((d) => d.status === 'Quitada');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-black text-gray-800">📈 Relatório Financeiro Consolidado</h2>
          <p className="text-sm text-gray-500">
            Resumo executivo do seu progresso, dívidas e projeções de quitação
          </p>
        </div>
        <Button onClick={handlePrint} variant="primary">
          🖨️ Exportar PDF / Imprimir
        </Button>
      </div>

      {/* ÁREA IMPRESSA DO RELATÓRIO */}
      <div ref={printRef} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Cabeçalho do Documento */}
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                Q+
              </div>
              <h1 className="text-2xl font-black text-gray-900">QUITA+ — Auxiliador Financeiro</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">Relatório de Saúde Financeira & Plano de Quitação</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            <p>Status: Documento Pessoal</p>
          </div>
        </div>

        {/* Resumo Consolidado (Cards) */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">1. Panorama Geral</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block">Total Devedor Restante</span>
              <strong className="text-lg text-red-600">{formatBRL(metrics?.totalDebt)}</strong>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block">Total Já Pago</span>
              <strong className="text-lg text-emerald-600">{formatBRL(metrics?.totalPaid)}</strong>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block">Comprometimento Mensal</span>
              <strong className="text-lg text-indigo-600">{formatBRL(metrics?.monthlyCommitment)}/mês</strong>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500 block">Renda Livre Estimada</span>
              <strong className="text-lg text-blue-600">{formatBRL(metrics?.availableIncome)}</strong>
            </div>
          </div>
        </div>

        {/* Tabela de Dívidas Ativas */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
            2. Detalhamento de Dívidas Ativas ({activeDebts.length})
          </h3>
          {activeDebts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-500 uppercase font-semibold">
                    <th className="p-3">Nome / Instituição</th>
                    <th className="p-3">Parcela Mensal</th>
                    <th className="p-3">Parcelas Restantes</th>
                    <th className="p-3">Saldo Restante</th>
                    <th className="p-3">Taxa Juros a.m.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeDebts.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-800">
                        {d.name} <span className="text-gray-400 font-normal">({d.institution})</span>
                      </td>
                      <td className="p-3 font-semibold text-gray-700">{formatBRL(d.installmentAmount)}</td>
                      <td className="p-3">{d.remainingInstallments} / {d.totalInstallments}</td>
                      <td className="p-3 font-bold text-red-600">{formatBRL(d.remainingAmount)}</td>
                      <td className="p-3">{d.monthlyInterestRate ? `${d.monthlyInterestRate}%` : 'N/I'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-4 rounded-xl">
              Parabéns! Você não possui nenhuma dívida ativa cadastrada no momento.
            </p>
          )}
        </div>

        {/* Histórico Recente de Pagamentos */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
            3. Registro Recente de Pagamentos e Eventos
          </h3>
          <div className="space-y-2 text-xs">
            {history && history.length > 0 ? (
              history.slice(0, 5).map((h, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                  <div>
                    <strong className="text-gray-800 block">{h.description || h.action}</strong>
                    <span className="text-gray-400">
                      {h.date?.seconds
                        ? new Date(h.date.seconds * 1000).toLocaleDateString('pt-BR')
                        : 'Data recente'}
                    </span>
                  </div>
                  {h.amount && <span className="font-bold text-emerald-600">{formatBRL(h.amount)}</span>}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">Nenhum evento registrado até o momento.</p>
            )}
          </div>
        </div>

        {/* Rodapé e Nota de Transparência */}
        <div className="border-t pt-4 text-[10px] text-gray-400 flex justify-between items-center">
          <p>QUITA+ — Plataforma de Organização Financeira Pessoal</p>
          <p>Este relatório apresenta cálculos matemáticos transparentes com base nos seus dados informados.</p>
        </div>
      </div>
    </div>
  );
}