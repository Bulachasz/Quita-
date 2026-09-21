import React from 'react';

export default function ScenarioComparison({ comparisonData }) {
  if (!comparisonData) return null;

  const { currentScenario, loanScenario, comparison } = comparisonData;

  const formatBRL = (val) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Análise Transparente de Cenários</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Situação Atual</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatBRL(currentScenario.monthlyCommitment)} <span className="text-sm font-normal text-gray-500">/mês</span></p>
          <div className="mt-4 text-sm space-y-1 text-gray-600">
            <p>Saldo Devedor Nominal: <strong className="text-gray-800">{formatBRL(currentScenario.totalNominalRemaining)}</strong></p>
            <p>Total para Quitação Hoje: <strong className="text-gray-800">{formatBRL(currentScenario.settlementQuoteNeeded)}</strong></p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Simulação do Empréstimo</span>
          <p className="text-2xl font-bold text-blue-900 mt-1">{formatBRL(loanScenario.monthlyPayment)} <span className="text-sm font-normal text-blue-600">/mês</span></p>
          <div className="mt-4 text-sm space-y-1 text-blue-800">
            <p>Custo Total Final: <strong>{formatBRL(loanScenario.totalCost)}</strong></p>
            <p>Juros Totais Estimados: <strong>{formatBRL(loanScenario.totalInterest)}</strong></p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {comparison.hasMonthlyReduction ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-start gap-2">
            <span>💡</span>
            <div>
              <strong>Redução Mensal de {formatBRL(comparison.monthlySavings)}:</strong>
              <p>Esta opção alivia o seu orçamento mensal e aumenta sua renda disponível imediata.</p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <strong>Aumento da Parcela Mensal:</strong>
              <p>A parcela simulada é maior do que a soma das parcelas atuais.</p>
            </div>
          </div>
        )}

        {comparison.hasTotalCostIncrease && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
            <span>🚨</span>
            <div>
              <strong>Atenção ao Custo Total:</strong>
              <p>Apesar do alívio mensal, você pagará <strong>{formatBRL(comparison.totalCostDifference)} a mais</strong> ao longo de todo o contrato devido ao alongamento do prazo.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}