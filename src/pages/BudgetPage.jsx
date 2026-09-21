import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { saveMonthlyBudget, getMonthlyBudget } from '../firebase/budgetService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Casa',
  'Transporte',
  'Saúde',
  'Lazer',
  'Assinaturas',
  'Outros'
];

export default function BudgetPage() {
  const { user } = useAuth();
  const { metrics, history = [], refreshData } = useFinancial();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [plannedIncome, setPlannedIncome] = useState('');
  const [categoriesBudget, setCategoriesBudget] = useState(
    DEFAULT_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {})
  );

  // Carregar orçamento do Firestore
  useEffect(() => {
    async function loadBudget() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getMonthlyBudget(user.uid);
        setPlannedIncome(data.plannedIncome || '');
        if (data.categories) {
          setCategoriesBudget((prev) => ({ ...prev, ...data.categories }));
        }
      } catch (err) {
        console.error("Erro ao carregar orçamento:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBudget();
  }, [user]);

  // Salvar Orçamento
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const formattedCategories = {};
      Object.keys(categoriesBudget).forEach((cat) => {
        formattedCategories[cat] = Number(categoriesBudget[cat]) || 0;
      });

      await saveMonthlyBudget(user.uid, {
        plannedIncome: Number(plannedIncome) || 0,
        categories: formattedCategories
      });
      if (refreshData) await refreshData();
      alert("Orçamento planejado salvo com sucesso!");
    } catch (err) {
      alert("Erro ao salvar orçamento.");
    } finally {
      setSaving(false);
    }
  };

  const formatBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

  // Calcular despesas reais do mês atual agrupadas por categoria a partir do histórico
  const actualExpensesByCategory = DEFAULT_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {});

  if (Array.isArray(history)) {
    history.forEach((item) => {
      if (item.action === 'DESPESA_ADICIONADA' && item.amount < 0) {
        const catFound = DEFAULT_CATEGORIES.find((c) =>
          item.description?.toLowerCase().includes(c.toLowerCase())
        );
        const categoryKey = catFound || 'Outros';
        actualExpensesByCategory[categoryKey] += Math.abs(item.amount);
      }
    });
  }

  const totalPlannedExpenses = Object.values(categoriesBudget).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );
  const totalActualExpenses = Object.values(actualExpensesByCategory).reduce(
    (acc, val) => acc + val,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800">💰 Planejado vs. Realizado</h2>
        <p className="text-sm text-gray-500">
          Defina metas para cada categoria e acompanhe seu consumo real do mês
        </p>
      </div>

      {/* Resumo de Indicadores Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase">Renda Planejada vs Real</span>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-xl font-bold text-gray-800">{formatBRL(plannedIncome)}</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Real: {formatBRL(metrics?.income)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase">Teto de Despesas Planejado</span>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-xl font-bold text-gray-800">{formatBRL(totalPlannedExpenses)}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                totalActualExpenses > totalPlannedExpenses && totalPlannedExpenses > 0
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              Real: {formatBRL(totalActualExpenses)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase">Comprometimento de Dívidas</span>
          <div className="mt-2 flex justify-between items-baseline">
            <span className="text-xl font-bold text-indigo-600">
              {formatBRL(metrics?.monthlyCommitment)}
            </span>
            <span className="text-xs text-gray-500">/mês fixo</span>
          </div>
        </div>
      </div>

      {/* Formulário de Planejamento e Progresso */}
      <form onSubmit={handleSaveBudget} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Definir Metas do Mês</h3>

        <div className="max-w-md">
          <Input
            label="Renda Mensal Prevista (R$)"
            type="number"
            step="0.01"
            value={plannedIncome}
            onChange={(e) => setPlannedIncome(e.target.value)}
            placeholder="Ex: 4000.00"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-700">Teto por Categoria de Despesa</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_CATEGORIES.map((cat) => {
              const plannedVal = Number(categoriesBudget[cat]) || 0;
              const actualVal = actualExpensesByCategory[cat] || 0;
              const percent = plannedVal > 0 ? Math.min(100, Math.round((actualVal / plannedVal) * 100)) : 0;
              const isOver = actualVal > plannedVal && plannedVal > 0;

              return (
                <div key={cat} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-800">{cat}</span>
                    <span className={`text-xs font-bold ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                      Gasto: {formatBRL(actualVal)}
                    </span>
                  </div>

                  <Input
                    type="number"
                    step="0.01"
                    value={categoriesBudget[cat] || ''}
                    onChange={(e) => setCategoriesBudget({ ...categoriesBudget, [cat]: e.target.value })}
                    placeholder="Teto planejado R$"
                    className="bg-white"
                  />

                  {/* Barra de Progresso do Teto */}
                  {plannedVal > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>{percent}% do teto utilizado</span>
                        <span>Limite: {formatBRL(plannedVal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" isLoading={saving}>
            Salvar Orçamento Planejado
          </Button>
        </div>
      </form>
    </div>
  );
}