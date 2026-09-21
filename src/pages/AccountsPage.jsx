import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { createAccount } from '../firebase/accountService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';

export function AccountsPage() {
  const { user } = useAuth();
  const { accounts, refreshData } = useFinancial();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    institution: 'Nubank',
    type: 'Conta Corrente',
    initialBalance: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await createAccount(user.uid, form);
      await refreshData();
      setIsOpen(false);
      setForm({ name: '', institution: 'Nubank', type: 'Conta Corrente', initialBalance: '' });
    } catch (err) {
      alert(err.message || "Erro ao cadastrar conta");
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">💰 Minhas Contas</h2>
          <p className="text-sm text-gray-500">Gerencie seus saldos bancários e carteiras</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>+ Nova Conta</Button>
      </div>

      {/* Grid de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {acc.type}
                </span>
                <h4 className="font-bold text-gray-800 text-lg mt-1">{acc.name}</h4>
                <p className="text-xs text-gray-400">{acc.institution}</p>
              </div>
              <span className="text-2xl">🏦</span>
            </div>

            <div className="pt-2 border-t border-gray-50">
              <span className="text-xs text-gray-400 block">Saldo Atual</span>
              <p className={`text-2xl font-black ${acc.currentBalance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                {formatBRL(acc.currentBalance)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cadastro de Conta */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Cadastrar Nova Conta">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Conta"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Conta Principal, Reserva Nubank"
            required
          />
          <Input
            label="Instituição"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            placeholder="Ex: Nubank, Itaú, Banco do Brasil"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de Conta</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white"
            >
              <option value="Conta Corrente">Conta Corrente</option>
              <option value="Conta Salário">Conta Salário</option>
              <option value="Poupança">Poupança</option>
              <option value="Carteira / Dinheiro">Carteira / Dinheiro</option>
              <option value="Conta Digital">Conta Digital</option>
            </select>
          </div>
          <Input
            label="Saldo Inicial (R$)"
            type="number"
            step="0.01"
            value={form.initialBalance}
            onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
            placeholder="0.00"
            required
          />
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={loading}>Salvar Conta</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}