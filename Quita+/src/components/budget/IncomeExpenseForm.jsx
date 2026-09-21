import React from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function IncomeExpenseForm({ onSaveBudget, budget = {} }) {
  const [income, setIncome] = React.useState(budget.income || '');
  const [expenses, setExpenses] = React.useState(budget.expenses || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveBudget({ income: Number(income), expenses: Number(expenses) });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
      <h3 className="font-bold text-gray-800 border-b pb-2">Configurar Renda e Despesas Fixas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Renda Líquida Mensal (R$)" type="number" step="0.01" value={income} onChange={(e) => setIncome(e.target.value)} required placeholder="Ex: 3500,00" />
        <Input label="Despesas Fixas Sem Dívidas (R$)" type="number" step="0.01" value={expenses} onChange={(e) => setExpenses(e.target.value)} required placeholder="Ex: 1800,00" />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit">Atualizar Orçamento</Button>
      </div>
    </form>
  );
}