import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { DebtProgressBar } from '../components/dashboard/DebtProgressBar';
import { FinancialAlerts } from '../components/dashboard/FinancialAlerts';
import { Button } from '../components/common/Button';

export default function Dashboard({ setActiveTab }) {
  const { metrics, debts = [], history = [] } = useFinancial();

  // Gerar alertas inteligentes com base nos dados
  const alerts = [];

  const overdueDebts = debts.filter((d) => d.status === 'Ativa' && d.hasOverdue);
  if (overdueDebts.length > 0) {
    alerts.push({
      type: 'danger',
      title: 'Atenção com parcelas em atraso',
      message: `Você possui ${overdueDebts.length} dívida(s) com parcelas pendentes de pagamento.`,
    });
  }

  const highInterestDebts = debts.filter((d) => (d.monthlyInterestRate || 0) >= 4);
  if (highInterestDebts.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Taxa de Juros Elevada',
      message: `A dívida "${highInterestDebts[0].name}" possui taxa de juros de ${highInterestDebts[0].monthlyInterestRate}% a.m. Considere simular uma quitação para ela.`,
    });
  }

  return (
    <div className="space-y-6">
      {/* BANNER DE BOAS-VINDAS / TUTORIAL */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-base flex items-center gap-1.5">
            Novo por aqui? Vamos organizar suas dívidas! 👋
          </h3>
          <p className="text-xs text-indigo-100">
            Aprenda em 2 minutos como cadastrar dívidas, simular empréstimos e usar todas as funções.
          </p>
        </div>
        <button
          onClick={() => setActiveTab && setActiveTab('help')}
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition whitespace-nowrap cursor-pointer"
        >
          🎓 Ver Tutorial Completo
        </button>
      </div>

      {/* Visão Geral de Métricas */}
      <MetricsOverview metrics={metrics} />

      {/* Barra de Progresso Geral */}
      <DebtProgressBar
        original={metrics.originalDebtTotal}
        paid={metrics.totalPaid}
        remaining={metrics.totalDebt}
      />

      {/* Alertas Inteligentes */}
      <FinancialAlerts alerts={alerts} />

      {/* Botões Rápidos de Ação */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-bold text-gray-800 text-base">Pronto para dar o próximo passo?</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Cadastre novas dívidas ou simule opções para economizar juros futuros.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button onClick={() => setActiveTab && setActiveTab('debts')} variant="primary" className="flex-1 sm:flex-none">
            + Adicionar Dívida
          </Button>
          <Button onClick={() => setActiveTab && setActiveTab('simulations')} variant="secondary" className="flex-1 sm:flex-none">
            📊 Simular Quitação
          </Button>
        </div>
      </div>
    </div>
  );
}