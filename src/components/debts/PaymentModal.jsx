import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function PaymentModal({ isOpen, onClose, debt, onConfirmPayment }) {
  const [amount, setAmount] = useState(debt?.installmentAmount || '');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  if (!debt) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmPayment({
      debtId: debt.id,
      amount: Number(amount),
      paymentMethod,
      paidDate,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registrar Pagamento - ${debt.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Valor do Pagamento (R$)" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Método de Pagamento</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white">
            <option value="Pix">Pix</option>
            <option value="Boleto">Boleto</option>
            <option value="Débito Automático">Débito Automático</option>
            <option value="Cartão">Cartão</option>
          </select>
        </div>

        <Input label="Data do Pagamento" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} required />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="secondary">Confirmar Pagamento</Button>
        </div>
      </form>
    </Modal>
  );
}