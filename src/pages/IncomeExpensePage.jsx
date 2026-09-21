import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { addIncomeTransaction, addExpenseTransaction } from '../firebase/accountService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export function IncomeExpensePage() {
  const { user } = useAuth();
  const { accounts, refreshData } = useFinancial();
  const [activeTab, setActiveTab] = useState('expense'); // 'income' ou 'expense'
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Alimentação',
    accountId: accounts[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !form.accountId) {
      alert("Selecione uma conta bancária válida.");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'income') {
        await addIncomeTransaction(user.uid, form);
      } else {
        await addExpenseTransaction(user.uid, form);
      }
      await refreshData();
      alert("Lançamento efetuado com sucesso!");
      setForm({ description: '', amount: '', category: 'Alimentação', accountId: accounts[0]?.id || '', date: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) {
      alert(err.message || "Erro ao realizar lançamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => { setActiveTab('expense'); setForm({ ...form, category: 'Alimentação' }); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600'}`}
        >
          💸 Registrar Despesa
        </button>
        <button
          onClick={() => { setActiveTab('income'); setForm({ ...form, category: 'Salário' }); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-600'}`}
        >
          💵 Registrar Receita
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={activeTab === 'income' ? 'Ex: Salário Mensal, Freelance' : 'Ex: Supermercado, Gasolina'}
          required
        />

        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white"
          >
            {activeTab === 'income' ? (
              <>
                <option value="Salário">Salário</option>
                <option value="Freelance">Freelance</option>
                <option value="Renda Extra">Renda Extra</option>
                <option value="Investimentos">Rendimento de Investimentos</option>
                <option value="Outros">Outros</option>
              </>
            ) : (
              <>
                <option value="Alimentação">Alimentação</option>
                <option value="Casa">Casa (Aluguel, Água, Luz)</option>
                <option value="Transporte">Transporte</option>
                <option value="Saúde">Saúde</option>
                <option value="Lazer">Lazer</option>
                <option value="Assinaturas">Assinaturas / Serviços</option>
                <option value="Outros">Outros</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Conta Bancária</label>
          <select
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white"
            required
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (R$ {(acc.currentBalance || 0).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Data do Lançamento"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <Button type="submit" isLoading={loading} className="w-full" variant={activeTab === 'income' ? 'secondary' : 'primary'}>
          {activeTab === 'income' ? 'Salvar Receita' : 'Salvar Despesa'}
        </Button>
      </form>
    </div>
  );
}