import React, { useState } from 'react';
import { Button } from '../components/common/Button';

export default function HelpPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('getting-started');

  const steps = [
    {
      num: '1',
      title: 'Cadastre suas Dívidas e Cartões',
      icon: '💳',
      desc: 'Comece cadastrando suas dívidas atuais (cartões, empréstimos, financiamentos, carnês). Informe o valor original, quantidade de parcelas e o valor de quitação oferecido pela instituição.',
      actionText: 'Ir para Minhas Dívidas',
      tabKey: 'debts',
    },
    {
      num: '2',
      title: 'Configure seu Orçamento Mensal',
      icon: '💰',
      desc: 'Na aba "Meu Orçamento", defina sua renda mensal e adicione suas despesas fixas. Você também pode criar categorias personalizadas (ex: Pets, Educação, Farmácia).',
      actionText: 'Ir para Meu Orçamento',
      tabKey: 'budget',
    },
    {
      num: '3',
      title: 'Simule Formas Diferentes de Quitação',
      icon: '📊',
      desc: 'No "Simulador QUITA+", escolha quais dívidas quer quitar e teste cenários com empréstimos consolidados. O sistema mostra com transparência se a parcela diminui e se o custo total aumenta.',
      actionText: 'Testar Simulador',
      tabKey: 'simulations',
    },
    {
      num: '4',
      title: 'Acompanhe a Agenda de Vencimentos',
      icon: '📅',
      desc: 'Consulte o Calendário para ver o próximo vencimento de cada compromisso. Clique na seta do card da dívida para ver o cronograma individual de cada parcela.',
      actionText: 'Ver Calendário',
      tabKey: 'calendar',
    },
    {
      num: '5',
      title: 'Gere Relatórios Executivos em PDF',
      icon: '📈',
      desc: 'Acompanhe seu progresso acumulado, histórico de pagamentos e exporte relatórios consolidados em PDF com um único clique para guardar ou imprimir.',
      actionText: 'Ver Relatórios',
      tabKey: 'reports',
    },
  ];

  const faqs = [
    {
      q: 'O QUITA+ recomenda automaticamente que eu faça um empréstimo?',
      a: 'Não! O QUITA+ é um auxiliador imparcial. Ele apenas apresenta os cálculos matemáticos transparentes (diferença da parcela, variação do custo total e alteração no prazo) para que você tome a melhor decisão.',
    },
    {
      q: 'O que significa "Valor para Quitar Hoje"?',
      a: 'É o valor com desconto que o banco ou credora oferece caso você queira quitar o contrato à vista antes do prazo final. Usar esse valor nas simulações reduz o custo total do empréstimo simulado.',
    },
    {
      q: 'Como funciona o cálculo de juros nas simulações?',
      a: 'Você pode escolher entre a Tabela PRICE (parcelas fixas) e a Tabela SAC (amortização constante e parcelas decrescentes). Todos os cálculos utilizam precisão exata de centavos.',
    },
    {
      q: 'Meus dados bancários estão seguros?',
      a: 'Sim! O QUITA+ nunca solicita senhas bancárias, senhas de cartão ou números de documentos confidenciais. Além disso, cada usuário só consegue visualizar seus próprios dados através das regras de segurança do Firebase.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black text-gray-800">🎓 Tutorial & Central de Ajuda</h2>
        <p className="text-sm text-gray-500">
          Aprenda a utilizar todos os recursos do QUITA+ para organizar suas finanças passo a passo
        </p>
      </div>

      {/* Navegação entre abas de ajuda */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('getting-started')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'getting-started'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          🚀 Passo a Passo (Guia Rápido)
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'faq'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          ❓ Dúvidas Frequentes (FAQ)
        </button>
      </div>

      {/* GUIA PASSO A PASSO */}
      {activeTab === 'getting-started' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-gray-200 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
                      {step.num}
                    </span>
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{step.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                </div>

                {onNavigate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate(step.tabKey)}
                    className="w-full text-xs font-bold"
                  >
                    {step.actionText} →
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Dica de Ouro */}
          <div className="p-5 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-200/60 rounded-2xl flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-gray-900 text-sm">Dica de Ouro do QUITA+</h4>
              <p className="text-gray-700 leading-relaxed">
                Ao negociar com bancos, sempre solicite o <strong>"Valor para quitação antecipada hoje"</strong>. Ao inserir essa informação nas dívidas cadastradas, o simulador conseguirá calcular economias reais de juros futuros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DÚVIDAS FREQUENTES */}
      {activeTab === 'faq' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-base border-b pb-3">Perguntas & Respostas</h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span className="text-indigo-600">Q.</span> {faq.q}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}