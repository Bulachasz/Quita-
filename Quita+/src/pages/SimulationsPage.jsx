import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useSimulations } from '../hooks/useSimulations';
import ScenarioComparison from '../components/simulations/ScenarioComparison';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export default function SimulationsPage() {
  const { debts } = useFinancial();
  const { runSimulation, createAndSaveSimulation } = useSimulations();
  
  const [selectedDebtIds, setSelectedDebtIds] = useState([]);
  const [loanAmount, setLoanAmount] = useState('');
  const [rate, setRate] = useState('2.0');
  const [termMonths, setTermMonths] = useState('24');
  const [system, setSystem] = useState('PRICE');
  const [comparisonResult, setComparisonResult] = useState(null);

  const toggleSelectDebt = (id) => {
    setSelectedDebtIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSimulate = (e) => {
    e.preventDefault();
    const selectedDebts = debts.filter(d => selectedDebtIds.includes(d.id));
    const result = runSimulation({
      selectedDebts,
      loanAmount: Number(loanAmount),
      interestRate: Number(rate),
      termMonths: Number(termMonths),
      amortizationSystem: system
    });
    setComparisonResult(result);
  };

  const handleSave = async () => {
    if (!comparisonResult) return;
    const selectedDebts = debts.filter(d => selectedDebtIds.includes(d.id));
    await createAndSaveSimulation('Simulação de Quitação', {
      selectedDebts,
      loanAmount,
      interestRate: rate,
      termMonths,
      amortizationSystem: system
    });
    alert('Simulação salva com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Simulador QUITA+</h2>
        <p className="text-xs text-gray-500">Selecione dívidas e compare se vale a pena contratar um novo empréstimo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Configuração */}
        <form onSubmit={handleSimulate} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm border-b pb-2">1. Escolha as Dívidas para Quitar</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {debts.map(debt => (
              <label key={debt.id} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDebtIds.includes(debt.id)}
                  onChange={() => toggleSelectDebt(debt.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold truncate flex-1">{debt.name}</span>
                <span className="text-gray-500">R$ {debt.remainingAmount}</span>
              </label>
            ))}
          </div>

          <h3 className="font-bold text-gray-800 text-sm border-b pb-2 pt-2">2. Condições do Novo Empréstimo</h3>
          <Input label="Valor do Empréstimo (R$)" type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Taxa (% a.m.)" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} required />
            <Input label="Prazo (Meses)" type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Amortização</label>
            <select value={system} onChange={e => setSystem(e.target.value)} className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white">
              <option value="PRICE">PRICE (Parcelas Fixas)</option>
              <option value="SAC">SAC (Parcelas Decrescentes)</option>
            </select>
          </div>

          <Button type="submit" className="w-full">Calcular Comparativo</Button>
        </form>

        {/* Resultado Transparente */}
        <div className="lg:col-span-2 space-y-4">
          {comparisonResult ? (
            <>
              <ScenarioComparison comparisonData={comparisonResult} />
              <div className="flex justify-end">
                <Button onClick={handleSave} variant="secondary">💾 Salvar esta Simulação</Button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-200 text-center text-gray-400 text-sm">
              Preencha o formulário ao lado e clique em "Calcular Comparativo" para visualizar a análise completa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}