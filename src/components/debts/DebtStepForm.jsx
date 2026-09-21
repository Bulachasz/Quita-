import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function DebtStepForm({ onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    institution: 'Nubank',
    type: 'Cartão de Crédito',
    originalAmount: '',
    totalInstallments: '',
    paidInstallments: '0',
    installmentAmount: '',
    monthlyInterestRate: '',
    settlementAmount: '',
    dueDate: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between mb-4 border-b pb-2 text-xs font-bold text-gray-400">
        <span className={step >= 1 ? 'text-indigo-600' : ''}>1. Identificação</span>
        <span className={step >= 2 ? 'text-indigo-600' : ''}>2. Valores</span>
        <span className={step >= 3 ? 'text-indigo-600' : ''}>3. Parcelas</span>
        <span className={step >= 4 ? 'text-indigo-600' : ''}>4. Quitação</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Input label="Nome da Dívida" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Fatura Cartão" required />
          <Input label="Instituição Financeira" name="institution" value={formData.institution} onChange={handleChange} placeholder="Ex: Nubank, Itaú" />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Input label="Valor Original (R$)" name="originalAmount" type="number" step="0.01" value={formData.originalAmount} onChange={handleChange} required />
          <Input label="Taxa de Juros Mensal (%)" name="monthlyInterestRate" type="number" step="0.01" value={formData.monthlyInterestRate} onChange={handleChange} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Input label="Total de Parcelas" name="totalInstallments" type="number" value={formData.totalInstallments} onChange={handleChange} required />
          <Input label="Parcelas Já Pagas" name="paidInstallments" type="number" value={formData.paidInstallments} onChange={handleChange} />
          <Input label="Valor Mensal da Parcela (R$)" name="installmentAmount" type="number" step="0.01" value={formData.installmentAmount} onChange={handleChange} required />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Input label="Valor para Quitar Hoje (R$ - opcional)" name="settlementAmount" type="number" step="0.01" value={formData.settlementAmount} onChange={handleChange} tooltip="Valor oferecido com desconto pela instituição" />
          <Input label="Dia do Vencimento" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
        </div>
      )}

      <div className="flex justify-between gap-3 pt-4 border-t">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={handlePrev}>Voltar</Button>
        ) : (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        )}

        {step < 4 ? (
          <Button type="button" onClick={handleNext}>Próximo</Button>
        ) : (
          <Button type="submit" variant="secondary">Salvar Dívida</Button>
        )}
      </div>
    </form>
  );
}