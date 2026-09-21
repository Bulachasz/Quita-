import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { CreditCardWidget } from '../components/cards/CreditCardWidget';

export default function CardsPage() {
  const { cards } = useFinancial();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Cartões de Crédito</h2>
        <p className="text-xs text-gray-500">Acompanhe limites, faturas e vencimentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.length > 0 ? (
          cards.map((card) => <CreditCardWidget key={card.id} card={card} />)
        ) : (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
            Nenhum cartão cadastrado ainda. As faturas dos seus cartões cadastrados em dívidas aparecerão organizadas aqui.
          </div>
        )}
      </div>
    </div>
  );
}