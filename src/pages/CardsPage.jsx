import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { createCreditCard, addCardPurchase, payCardInvoice } from '../firebase/cardService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';

export default function CardsPage() {
  const { user } = useAuth();
  const { cards, accounts, refreshData } = useFinancial();
  
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);

  // Formulário de Novo Cartão
  const [cardForm, setCardForm] = useState({
    name: '',
    institution: 'Nubank',
    limit: '',
    closingDay: '1',
    dueDay: '10'
  });

  // Formulário de Compra Parcelada
  const [purchaseForm, setPurchaseForm] = useState({
    description: '',
    amount: '',
    installments: '1',
    category: 'Compras',
    date: new Date().toISOString().split('T')[0]
  });

  // Formulário de Pagamento de Fatura
  const [payForm, setPayForm] = useState({
    accountId: accounts[0]?.id || '',
    amount: ''
  });

  const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  // Criar Cartão
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createCreditCard(user.uid, cardForm);
      await refreshData();
      setIsCardModalOpen(false);
      setCardForm({ name: '', institution: 'Nubank', limit: '', closingDay: '1', dueDay: '10' });
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar cartão.');
    } finally {
      setLoading(false);
    }
  };

  // Registrar Compra
  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!user || !selectedCard) return;
    setLoading(true);
    try {
      await addCardPurchase(user.uid, selectedCard.id, purchaseForm);
      await refreshData();
      setIsPurchaseModalOpen(false);
      setPurchaseForm({ description: '', amount: '', installments: '1', category: 'Compras', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert(err.message || 'Erro ao registrar compra.');
    } finally {
      setLoading(false);
    }
  };

  // Pagar Fatura
  const handlePayInvoice = async (e) => {
    e.preventDefault();
    if (!user || !selectedCard || !payForm.accountId) return;
    setLoading(true);
    try {
      await payCardInvoice(user.uid, selectedCard.id, payForm.accountId, payForm.amount);
      await refreshData();
      setIsPayModalOpen(false);
      setPayForm({ accountId: accounts[0]?.id || '', amount: '' });
    } catch (err) {
      alert(err.message || 'Erro ao pagar fatura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">💳 Meus Cartões de Crédito</h2>
          <p className="text-sm text-gray-500">Acompanhe limites, faturas e parcelamentos futuros</p>
        </div>
        <Button onClick={() => setIsCardModalOpen(true)}>+ Cadastrar Cartão</Button>
      </div>

      {/* Lista de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.length > 0 ? (
          cards.map((card) => {
            const usedLimit = (card.limit || 0) - (card.availableLimit || 0);
            const usedPercent = card.limit > 0 ? Math.round((usedLimit / card.limit) * 100) : 0;

            return (
              <div key={card.id} className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">{card.institution}</span>
                    <h4 className="text-lg font-bold mt-0.5">{card.name}</h4>
                  </div>
                  <span className="text-2xl">💳</span>
                </div>

                {/* Informações da Fatura e Limite */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Fatura Atual</span>
                    <span className="font-bold text-red-400 text-sm">{formatBRL(card.currentInvoice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Limite Disponível</span>
                    <span className="font-bold text-emerald-400">{formatBRL(card.availableLimit)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Limite Total</span>
                    <span>{formatBRL(card.limit)}</span>
                  </div>

                  {/* Barra de Limite */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all ${usedPercent > 80 ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Ações do Cartão */}
                <div className="pt-3 border-t border-slate-800 flex justify-between gap-2">
                  <button
                    onClick={() => { setSelectedCard(card); setIsPurchaseModalOpen(true); }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition"
                  >
                    + Nova Compra
                  </button>
                  <button
                    onClick={() => { setSelectedCard(card); setPayForm({ ...payForm, amount: card.currentInvoice }); setIsPayModalOpen(true); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition"
                  >
                    Pagar Fatura
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
            Nenhum cartão cadastrado ainda. Clique em "+ Cadastrar Cartão" acima para começar.
          </div>
        )}
      </div>

      {/* Modal Cadastro Cartão */}
      <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title="Cadastrar Cartão de Crédito">
        <form onSubmit={handleCreateCard} className="space-y-4">
          <Input label="Nome do Cartão" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} placeholder="Ex: Nubank Roxinho, Itaú Click" required />
          <Input label="Instituição/Banco" value={cardForm.institution} onChange={(e) => setCardForm({ ...cardForm, institution: e.target.value })} placeholder="Ex: Nubank, Itaú" />
          <Input label="Limite Total (R$)" type="number" step="0.01" value={cardForm.limit} onChange={(e) => setCardForm({ ...cardForm, limit: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Dia de Fechamento" type="number" min="1" max="31" value={cardForm.closingDay} onChange={(e) => setCardForm({ ...cardForm, closingDay: e.target.value })} required />
            <Input label="Dia de Vencimento" type="number" min="1" max="31" value={cardForm.dueDay} onChange={(e) => setCardForm({ ...cardForm, dueDay: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCardModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={loading}>Salvar Cartão</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Compra Parcelada */}
      <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title={`Nova Compra - ${selectedCard?.name}`}>
        <form onSubmit={handleAddPurchase} className="space-y-4">
          <Input label="Descrição do Produto/Serviço" value={purchaseForm.description} onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })} placeholder="Ex: Smart TV, Supermercado" required />
          <Input label="Valor Total da Compra (R$)" type="number" step="0.01" value={purchaseForm.amount} onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })} required />
          <Input label="Número de Parcelas" type="number" min="1" max="72" value={purchaseForm.installments} onChange={(e) => setPurchaseForm({ ...purchaseForm, installments: e.target.value })} required />
          <Input label="Data da Compra" type="date" value={purchaseForm.date} onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsPurchaseModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={loading}>Registrar Compra</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Pagamento de Fatura */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={`Pagar Fatura - ${selectedCard?.name}`}>
        <form onSubmit={handlePayInvoice} className="space-y-4">
          <Input label="Valor do Pagamento (R$)" type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} required />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Debitar da Conta</label>
            <select
              value={payForm.accountId}
              onChange={(e) => setPayForm({ ...payForm, accountId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Saldo: R$ {(acc.currentBalance || 0).toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsPayModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={loading} variant="secondary">Confirmar Pagamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}