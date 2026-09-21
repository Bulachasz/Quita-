import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { DebtProgressBar } from '../components/dashboard/DebtProgressBar';
import { FinancialAlerts } from '../components/dashboard/FinancialAlerts';
import { Button } from '../components/common/Button';

export default function Dashboard({ onAddDebt, onStartSimulation }) {
  const { metrics, debts, loadingData } = useFinancial();

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
        Carregando seus dados financeiros...
      </div>
    );
  }

  // Geração de alertas baseados em dados reais
  const alerts = [];
  const activeDebts = debts.filter(d => d.status === 'Ativa');
  
  if (metrics.availableIncome < 0) {
    alerts.push({
      type: 'danger',
      title: 'Orçamento Comprometido',
      message: 'Suas despesas e dívidas ultrapassam sua renda líquida cadastrada!'
    });
  }

  const highInterestDebt = activeDebts.find(d => (d.monthlyInterestRate || 0) > 3);
  if (highInterestDebt) {
    alerts.push({
      type: 'warning',
      title: 'Juros Elevados Detectados',
      message: `A dívida "${highInterestDebt.name}" possui taxa de ${highInterestDebt.monthlyInterestRate}% a.m. Considere priorizar sua quitação ou simular uma troca.`
    });
  }

  return (
    <div className="space-y-6">
      {/* Boas-Vindas */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Vamos organizar suas dívidas</h2>
          <p className="text-xs text-slate-300 mt-1">Acompanhe seu progresso real e simule cenários para otimizar seus pagamentos.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onAddDebt} variant="secondary" size="sm">+ Adicionar Dívida</Button>
          <Button onClick={onStartSimulation} variant="primary" size="sm">📊 Simular Quitação</Button>
        </div>
      </div>

      {/* Visão Geral */}
      <MetricsOverview metrics={metrics} />

      {/* Progresso de Quitação */}
      <DebtProgressBar
        original={metrics.originalDebtTotal}
        paid={metrics.totalPaid}
        remaining={metrics.totalDebt}
      />

      {/* Alertas Financeiros */}
      <FinancialAlerts alerts={alerts} />
    </div>
  );
}