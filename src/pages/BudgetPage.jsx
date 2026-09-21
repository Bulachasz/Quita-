import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { saveMonthlyBudget, getMonthlyBudget } from '../firebase/budgetService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';

const INITIAL_DEFAULT_CATEGORIES = [
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
  const [categoriesList, setCategoriesList] = useState(INITIAL_DEFAULT_CATEGORIES);
  const [categoriesBudget, setCategoriesBudget] = useState({});

  // Estado para Modal de Nova Categoria
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Carregar orçamento do Firestore
  useEffect(() => {
    async function loadBudget() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getMonthlyBudget(user.uid);
        setPlannedIncome(data.plannedIncome || '');
        
        if (data.categories) {
          // Unir categorias salvas no Firestore com a lista padrão
          const loadedCategoryNames = Object.keys(data.categories);
          const mergedList = Array.from(new Set([...INITIAL_DEFAULT_CATEGORIES, ...loadedCategoryNames]));
          
          setCategoriesList(mergedList);
          setCategoriesBudget(data.categories);
        } else {
          // Inicializar categorias vazias
          const initialMap = INITIAL_DEFAULT_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {});
          setCategoriesBudget(initialMap);
        }
      } catch (err) {
        console.error("Erro ao carregar orçamento:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBudget();
  }, [user]);

  // Adicionar Nova Categoria Personalizada
  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categoriesList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("Esta categoria já existe!");
      return;
    }

    setCategoriesList((prev) => [...prev, trimmed]);
    setCategoriesBudget((prev) => ({ ...prev, [trimmed]: '' }));
    setNewCategoryName('');
    setIsNewCategoryModalOpen(false);
  };

  // Remover Categoria Personalizada
  const handleRemoveCategory = (catName) => {
    if (INITIAL_DEFAULT_CATEGORIES.includes(catName)) {
      alert("Categorias padrão do sistema não podem ser removidas.");
      return;
    }

    if (confirm(`Deseja remover a categoria "${catName}" do planejamento?`)) {
      setCategoriesList((prev) => prev.filter((c) => c !== catName));
      setCategoriesBudget((prev) => {
        const copy = { ...prev };
        delete copy[catName];
        return copy;
      });
    }
  };

  // Salvar Orçamento no Firestore
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const formattedCategories = {};
      categoriesList.forEach((cat) => {
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
  const actualExpensesByCategory = categoriesList.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {});

  if (Array.isArray(history)) {
    history.forEach((item) => {
      if (item.action === 'DESPESA_ADICIONADA' && item.amount < 0) {
        const catFound = categoriesList.find((c) =>
          item.description?.toLowerCase().includes(c.toLowerCase())
        );
        const categoryKey = catFound || 'Outros';
        if (actualExpensesByCategory[categoryKey] !== undefined) {
          actualExpensesByCategory[categoryKey] += Math.abs(item.amount);
        } else {
          actualExpensesByCategory['Outros'] = (actualExpensesByCategory['Outros'] || 0) + Math.abs(item.amount);
        }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">💰 Planejado vs. Realizado</h2>
          <p className="text-sm text-gray-500">
            Defina metas para cada categoria e acompanhe seu consumo real do mês
          </p>
        </div>
        <Button onClick={() => setIsNewCategoryModalOpen(true)} variant="outline">
          + Nova Categoria
        </Button>
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
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-gray-700">Teto por Categoria de Despesa</h4>
            <button
              type="button"
              onClick={() => setIsNewCategoryModalOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              + Adicionar Categoria
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoriesList.map((cat) => {
              const plannedVal = Number(categoriesBudget[cat]) || 0;
              const actualVal = actualExpensesByCategory[cat] || 0;
              const percent = plannedVal > 0 ? Math.min(100, Math.round((actualVal / plannedVal) * 100)) : 0;
              const isOver = actualVal > plannedVal && plannedVal > 0;
              const isCustom = !INITIAL_DEFAULT_CATEGORIES.includes(cat);

              return (
                <div key={cat} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                      {cat}
                      {isCustom && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
                          Personalizada
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                        Gasto: {formatBRL(actualVal)}
                      </span>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="text-gray-400 hover:text-red-500 text-xs p-1"
                          title="Remover Categoria"
                        >
                          ✕
                        </button>
                      )}
                    </div>
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

      {/* Modal para Adicionar Nova Categoria */}
      <Modal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        title="Nova Categoria de Despesa"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <Input
            label="Nome da Categoria"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ex: Educação, Pets, Farmácia, Investimentos"
            required
          />
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsNewCategoryModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar Categoria</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}