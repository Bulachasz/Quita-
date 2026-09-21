import React from 'react';
import { useBudget } from '../hooks/useBudget';
import { IncomeExpenseForm } from '../components/budget/IncomeExpenseForm';
import { formatBRL } from '../utils/currencyFormatter';

export default function BudgetPage() {
  const { income, expenses, monthlyDebts, availableAfterDebts, debtCommitmentPercentage, updateBudget } = useBudget();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Meu Orçamento</h2>
        <p className="text-xs text-gray-500">Mapeamento da sua renda, gastos fixos e capacidade de pagamento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseForm budget={{ income, expenses }} onSaveBudget={updateBudget} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Diagnóstico de Comprometimento</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Renda Líquida:</span>
              <strong>{formatBRL(income)}</strong>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Despesas Fixas:</span>
              <strong>- {formatBRL(expenses)}</strong>
            </div>
            <div className="flex justify-between text-indigo-600">
              <span>Comprometimento com Dívidas:</span>
              <strong>- {formatBRL(monthlyDebts)}</strong>
            </div>
            <div className="pt-2 border-t flex justify-between text-base font-black">
              <span>Sobra Disponível:</span>
              <span className={availableAfterDebts >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {formatBRL(availableAfterDebts)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t">
            <span className="text-xs text-gray-400 block mb-1">Impacto das dívidas na renda:</span>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  debtCommitmentPercentage > 50 ? 'bg-red-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${debtCommitmentPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1 block text-right">{debtCommitmentPercentage}% comprometido</span>
          </div>
        </div>
      </div>
    </div>
  );
}