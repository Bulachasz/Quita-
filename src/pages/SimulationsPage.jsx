import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { calculateLoanComparison, calculateEarlyPayment } from '../calculations/financialCalculator';
import ScenarioComparison from '../components/simulations/ScenarioComparison';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export default function SimulationsPage() {
  const { debts = [], saveSimulation } = useFinancial();

  // Dívidas ativas selecionadas para quitação
  const activeDebts = debts.filter((d) => d.status !== 'Quitada');
  const [selectedDebtIds, setSelectedDebtIds] = useState(activeDebts.map((d) => d.id));

  // Parâmetros do Empréstimo Simulado
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('2.0');
  const [termMonths, setTermMonths] = useState('24');
  const [amortizationSystem, setAmortizationSystem] = useState('PRICE');

  // Resultado da Simulação de Empréstimo
  const [comparisonResult, setComparisonResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Estados para Simulação de Antecipação de Parcela Individual
  const [selectedDebtForAnticipation, setSelectedDebtForAnticipation] = useState('');
  const [monthsAhead, setMonthsAhead] = useState('1');
  const [anticipationResult, setAnticipationResult] = useState(null);

  const formatBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  // Selecionar/Deselecionar Todas as Dívidas
  const toggleSelectAll = () => {
    if (selectedDebtIds.length === activeDebts.length) {
      setSelectedDebtIds([]);
    } else {
      setSelectedDebtIds(activeDebts.map((d) => d.id));
    }
  };

  const toggleDebtSelection = (id) => {
    setSelectedDebtIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  // Preencher automaticamente o valor sugerido do empréstimo com base no valor de quitação
  const handleAutoFillLoanAmount = () => {
    const totalQuote = activeDebts
      .filter((d) => selectedDebtIds.includes(d.id))
      .reduce((acc, d) => {
        const remainingCount = Math.max(0, (d.totalInstallments || 0) - (d.paidInstallments || 0));
        const quote = d.settlementAmount && d.settlementAmount > 0
          ? Number(d.settlementAmount)
          : remainingCount * Number(d.installmentAmount || 0);
        return acc + quote;
      }, 0);

    setLoanAmount(totalQuote.toFixed(2));
  };

  // Simular Empréstimo Consolidador
  const handleSimulateLoan = (e) => {
    e.preventDefault();
    const selectedDebtsList = activeDebts.filter((d) => selectedDebtIds.includes(d.id));

    if (!selectedDebtsList.length) {
      alert("Selecione pelo menos uma dívida para simular a quitação.");
      return;
    }

    const amount = Number(loanAmount) || 0;
    if (amount <= 0) {
      alert("Informe um valor válido para o empréstimo.");
      return;
    }

    const result = calculateLoanComparison({
      currentDebtsList: selectedDebtsList,
      loanAmountRequested: amount,
      monthlyInterestRate: Number(interestRate),
      termMonths: Number(termMonths),
      amortizationSystem
    });

    setComparisonResult(result);
  };

  // Salvar Simulação
  const handleSaveSimulation = async () => {
    if (!comparisonResult || !saveSimulation) return;
    setSaving(true);
    try {
      await saveSimulation({
        simulationName: `Simulação Empréstimo R$ ${loanAmount}`,
        selectedDebtIds,
        loanAmount: Number(loanAmount),
        interestRate: Number(interestRate),
        termMonths: Number(termMonths),
        amortizationSystem,
        results: comparisonResult
      });
      alert("Simulação salva com sucesso no seu histórico!");
    } catch (err) {
      alert("Erro ao salvar simulação.");
    } finally {
      setSaving(false);
    }
  };

  // Simular Antecipação Individual
  const handleSimulateAnticipation = (e) => {
    e.preventDefault();
    const debt = activeDebts.find((d) => d.id === selectedDebtForAnticipation);
    if (!debt) {
      alert("Selecione uma dívida válida.");
      return;
    }

    const res = calculateEarlyPayment(
      debt.installmentAmount,
      debt.monthlyInterestRate || 2,
      Number(monthsAhead)
    );

    setAnticipationResult({
      debtName: debt.name,
      installmentAmount: debt.installmentAmount,
      monthsAhead: Number(monthsAhead),
      ...res
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-800">📊 Simulador QUITA+ de Estratégias</h2>
        <p className="text-sm text-gray-500">
          Compare matematicamente o impacto de pegar um empréstimo ou antecipar parcelas
        </p>
      </div>

      {/* MÓDULO 1: SIMULADOR DE EMPRÉSTIMO CONSOLIDADOR */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3">
          1. Simular Empréstimo para Quitação
        </h3>

        {/* Seleção de Dívidas */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700">Escolha as dívidas para incluir na simulação:</span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              {selectedDebtIds.length === activeDebts.length ? 'Deselecionar Todas' : 'Selecionar Todas'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeDebts.length > 0 ? (
              activeDebts.map((debt) => {
                const isSelected = selectedDebtIds.includes(debt.id);
                const remainingInst = Math.max(0, (debt.totalInstallments || 0) - (debt.paidInstallments || 0));
                const totalNominal = remainingInst * Number(debt.installmentAmount || 0);

                return (
                  <div
                    key={debt.id}
                    onClick={() => toggleDebtSelection(debt.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-800">{debt.name}</p>
                      <p className="text-xs text-gray-500">
                        {remainingInst}x de {formatBRL(debt.installmentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold block text-gray-700">{formatBRL(totalNominal)}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 col-span-full">Nenhuma dívida ativa cadastrada.</p>
            )}
          </div>
        </div>

        {/* Formulário do Empréstimo */}
        <form onSubmit={handleSimulateLoan} className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                label="Valor do Empréstimo (R$)"
                type="number"
                step="0.01"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="Ex: 15000"
                required
              />
              <button
                type="button"
                onClick={handleAutoFillLoanAmount}
                className="text-[11px] text-indigo-600 font-bold hover:underline mt-1"
              >
                ⚡ Usar total necessário para quitar hoje
              </button>
            </div>

            <Input
              label="Taxa de Juros Mensal (%)"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              required
            />

            <Input
              label="Prazo (Meses)"
              type="number"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              required
            />

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Sistema de Amortização</label>
              <select
                value={amortizationSystem}
                onChange={(e) => setAmortizationSystem(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white"
              >
                <option value="PRICE">Tabela PRICE (Parcelas Fixas)</option>
                <option value="SAC">Tabela SAC (Parcelas Decrescentes)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit">Calcular e Comparar Cenários</Button>
          </div>
        </form>

        {/* Resultado Transparente do Comparador */}
        {comparisonResult && (
          <div className="pt-4 border-t space-y-4">
            <ScenarioComparison comparisonData={comparisonResult} />
            <div className="flex justify-end">
              <Button onClick={handleSaveSimulation} isLoading={saving} variant="secondary">
                💾 Salvar esta Simulação
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MÓDULO 2: SIMULADOR DE ANTECIPAÇÃO DE PARCELAS */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3">
          2. Simular Antecipação de Parcela Individual
        </h3>
        <p className="text-xs text-gray-500">
          Descubra o desconto ao adiantar o pagamento de parcelas do fim do contrato
        </p>

        <form onSubmit={handleSimulateAnticipation} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Selecione a Dívida</label>
            <select
              value={selectedDebtForAnticipation}
              onChange={(e) => setSelectedDebtForAnticipation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white"
              required
            >
              <option value="">Escolha...</option>
              {activeDebts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({formatBRL(d.installmentAmount)}/mês)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantos meses antes do vencimento?"
            type="number"
            min="1"
            max="60"
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(e.target.value)}
            required
          />

          <Button type="submit" variant="outline">Simular Antecipação</Button>
        </form>

        {anticipationResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-sm text-emerald-900 mt-4">
            <h4 className="font-bold text-base">Resultado da Antecipação — {anticipationResult.debtName}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-1">
              <p>Valor Original da Parcela: <strong>{formatBRL(anticipationResult.installmentAmount)}</strong></p>
              <p>Valor com Desconto Hoje: <strong className="text-emerald-700 text-sm">{formatBRL(anticipationResult.presentValue)}</strong></p>
              <p>Economia em Juros: <strong className="text-emerald-800">{formatBRL(anticipationResult.discount)}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}