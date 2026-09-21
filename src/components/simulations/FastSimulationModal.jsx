import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { calculatePriceInstallment } from '../../calculations/financialCalculator';

export function FastSimulationModal({ isOpen, onClose }) {
  const [debtAmount, setDebtAmount] = useState('15000');
  const [rate, setRate] = useState('2');
  const [months, setMonths] = useState('24');
  const [result, setResult] = useState(null);

  const handleSimulate = (e) => {
    e.preventDefault();
    const res = calculatePriceInstallment(Number(debtAmount), Number(rate), Number(months));
    setResult(res);
  };

  const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Simulação Rápida">
      <form onSubmit={handleSimulate} className="space-y-4">
        <Input label="Valor das Dívidas (R$)" type="number" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Taxa Mensal (%)" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} required />
          <Input label="Prazo (Meses)" type="number" value={months} onChange={(e) => setMonths(e.target.value)} required />
        </div>

        <Button type="submit" className="w-full">Calcular Agora</Button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 text-sm text-indigo-900">
          <div className="flex justify-between font-bold text-base">
            <span>Parcela Estimada:</span>
            <span>{formatBRL(result.monthlyPayment)}/mês</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Custo Total Final:</span>
            <span>{formatBRL(result.totalCost)}</span>
          </div>
          <div className="flex justify-between text-xs text-indigo-700">
            <span>Total em Juros:</span>
            <span>{formatBRL(result.totalInterest)}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}