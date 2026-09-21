import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { DebtStepForm } from '../components/debts/DebtStepForm';
import { PaymentModal } from '../components/debts/PaymentModal';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { formatBRL } from '../utils/currencyFormatter';

export default function DebtsPage() {
  const { debts, addOrUpdateDebt, removeDebt, handlePayInstallment } = useFinancial();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);

  const handleSaveDebt = async (formData) => {
    await addOrUpdateDebt(formData);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Minhas Dívidas</h2>
          <p className="text-xs text-gray-500">Cadastre e acompanhe o pagamento de cada conta</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>+ Nova Dívida</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debts.map((debt) => (
          <div key={debt.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {debt.institution}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  debt.status === 'Quitada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {debt.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mt-2">{debt.name}</h3>
              <p className="text-xs text-gray-400">{debt.type}</p>

              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Valor Restante:</span>
                  <strong className="text-gray-900">{formatBRL(debt.remainingAmount)}</strong>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Parcela Mensal:</span>
                  <strong>{formatBRL(debt.installmentAmount)}</strong>
                </div>
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Parcelas:</span>
                  <span>{debt.paidInstallments} / {debt.totalInstallments} pagas</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={debt.status === 'Quitada'}
                onClick={() => setSelectedDebtForPayment(debt)}
              >
                Pagar Parcela
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDebt(debt.id)}
                className="text-red-500 hover:bg-red-50"
              >
                🗑️
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Adição em Etapas */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Cadastrar Nova Dívida">
        <DebtStepForm onSave={handleSaveDebt} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={!!selectedDebtForPayment}
        onClose={() => setSelectedDebtForPayment(null)}
        debt={selectedDebtForPayment}
        onConfirmPayment={async (info) => {
          await handlePayInstallment(info.debtId, null, info);
          setSelectedDebtForPayment(null);
        }}
      />
    </div>
  );
}