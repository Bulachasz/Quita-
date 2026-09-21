import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export default function BudgetPage() {
  const { budget, updateBudgetSettings, metrics } = useFinancial();

  const [income, setIncome] = useState(budget?.income || '');
  const [expenseList, setExpenseList] = useState(budget?.expenseList || [
    { id: 1, name: 'Aluguel / Condomínio', amount: 1200, category: 'Moradia' },
    { id: 2, name: 'Supermercado / Alimentação', amount: 800, category: 'Alimentação' },
    { id: 3, name: 'Energia & Água', amount: 250, category: 'Contas' },
  ]);

  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Outros');

  const formatBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  // Somatório das despesas lançadas na lista
  const totalExpensesFromList = expenseList.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const monthlyCommitment = metrics?.monthlyCommitment || 0;
  const availableIncome = (Number(income) || 0) - totalExpensesFromList - monthlyCommitment;

  // Adicionar nova despesa
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;

    const newItem = {
      id: Date.now(),
      name: newExpenseName,
      amount: Number(newExpenseAmount),
      category: newExpenseCategory,
    };

    const updated = [...expenseList, newItem];
    setExpenseList(updated);
    setNewExpenseName('');
    setNewExpenseAmount('');

    // Salvar no Firestore
    updateBudgetSettings({
      income: Number(income),
      expenses: updated.reduce((acc, item) => acc + item.amount, 0),
      expenseList: updated,
    });
  };

  // Remover despesa
  const handleRemoveExpense = (id) => {
    const updated = expenseList.filter((item) => item.id !== id);
    setExpenseList(updated);

    updateBudgetSettings({
      income: Number(income),
      expenses: updated.reduce((acc, item) => acc + item.amount, 0),
      expenseList: updated,
    });
  };

  // Atualizar Renda Total
  const handleSaveIncome = (e) => {
    e.preventDefault();
    updateBudgetSettings({
      income: Number(income),
      expenses: totalExpensesFromList,
      expenseList,
    });
    alert('Renda atualizada com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black text-gray-800">💰 Gestão de Orçamento & Despesas</h2>
        <p className="text-sm text-gray-500">
          Cadastre seus ganhos e despesas mensais para calcular a sobra real do seu orçamento
        </p>
      </div>

      {/* RESUMO DE CÁLCULO GERAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <span className="text-xs text-emerald-700 font-medium block">(+) Renda Total</span>
          <strong className="text-xl font-black text-emerald-800">{formatBRL(income)}</strong>
        </div>

        <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
          <span className="text-xs text-red-700 font-medium block">(-) Despesas Lançadas</span>
          <strong className="text-xl font-black text-red-800">{formatBRL(totalExpensesFromList)}</strong>
        </div>

        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
          <span className="text-xs text-indigo-700 font-medium block">(-) Dívidas / Parcelas</span>
          <strong className="text-xl font-black text-indigo-800">{formatBRL(monthlyCommitment)}</strong>
        </div>

        <div className={`p-4 rounded-2xl border ${availableIncome >= 0 ? 'bg-emerald-100 border-emerald-300' : 'bg-red-100 border-red-300'}`}>
          <span className="text-xs font-bold block text-gray-700">(=) Dinheiro Disponível</span>
          <strong className={`text-xl font-black ${availableIncome >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
            {formatBRL(availableIncome)}
          </strong>
        </div>
      </div>

      {/* FORMULÁRIO DE RENDA */}
      <form onSubmit={handleSaveIncome} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <Input
            label="Renda Líquida Mensal (Salário + Renda Extra em R$)"
            type="number"
            step="0.01"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Ex: 3500.00"
            required
          />
        </div>
        <Button type="submit" variant="secondary">
          Atualizar Renda
        </Button>
      </form>

      {/* LANÇAMENTO DE NOVAS DESPESAS */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="font-bold text-gray-800 text-base border-b pb-3">Lançar Nova Despesa do Mês</h3>

        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <Input
              label="Descrição da Despesa"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              placeholder="Ex: Supermercado, Luz, Internet"
              required
            />
          </div>

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(e.target.value)}
            placeholder="0,00"
            required
          />

          <Button type="submit" variant="primary" className="w-full">
            + Adicionar
          </Button>
        </form>
      </div>

      {/* LISTA DE DESPESAS CADASTRADAS */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-gray-800 text-base">Relação de Despesas do Mês ({expenseList.length})</h3>
          <span className="text-xs text-gray-500 font-semibold">Total: {formatBRL(totalExpensesFromList)}</span>
        </div>

        {expenseList.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {expenseList.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-800 block">{item.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">{item.category || 'Geral'}</span>
                </div>

                <div className="flex items-center gap-4">
                  <strong className="text-red-600 font-black">{formatBRL(item.amount)}</strong>
                  <button
                    onClick={() => handleRemoveExpense(item.id)}
                    className="text-gray-400 hover:text-red-600 p-1 text-xs font-bold transition"
                    title="Remover despesa"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">
            Nenhuma despesa lançada ainda. Adicione suas contas fixas acima.
          </p>
        )}
      </div>
    </div>
  );
}