import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteAllUserData } from '../firebase/firestoreService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export default function SettingsPage() {
  const { user, changePassword, deleteAccount, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Alterar Senha
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("A nova senha deve conter pelo menos 6 caracteres.");
      return;
    }
    setLoadingPass(true);
    try {
      await changePassword(newPassword);
      alert("Senha alterada com sucesso!");
      setNewPassword('');
    } catch (err) {
      alert("Erro ao alterar senha. Caso faça muito tempo do seu último login, faça login novamente.");
    } finally {
      setLoadingPass(false);
    }
  };

  // Excluir Todos os Dados e Conta (LGPD)
  const handleDeleteAllDataAndAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ ATENÇÃO: Esta ação é irreversível! Todas as suas dívidas, cartões, histórico e simulações serão permanentemente excluídos."
    );
    if (!confirmed) return;

    setLoadingDelete(true);
    try {
      await deleteAllUserData(user.uid);
      await deleteAccount();
      alert("Sua conta e todos os seus dados foram excluídos com sucesso.");
    } catch (err) {
      alert("Erro ao excluir conta. Se necessário, faça login novamente e tente a exclusão.");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-gray-800">⚙️ Configurações da Conta</h2>
        <p className="text-sm text-gray-500">Gerencie sua segurança, perfil e privacidade de dados</p>
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800 border-b pb-3">Informações do Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-gray-400 block font-medium">E-mail Cadastrado</span>
            <strong className="text-gray-800">{user?.email}</strong>
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Nome de Exibição</span>
            <strong className="text-gray-800">{user?.displayName || 'Usuário QUITA+'}</strong>
          </div>
        </div>
      </div>

      {/* Alterar Senha */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800 border-b pb-3">Alterar Senha de Acesso</h3>
        <div className="max-w-md">
          <Input
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            required
          />
        </div>
        <Button type="submit" isLoading={loadingPass}>
          Atualizar Senha
        </Button>
      </form>

      {/* Zona de Perigo (LGPD & Privacidadae) */}
      <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 space-y-4">
        <h3 className="font-bold text-red-800 border-b border-red-100 pb-3">Privacidade & Exclusão de Dados (LGPD)</h3>
        <p className="text-xs text-red-700 leading-relaxed">
          Você tem total controle sobre seus dados financeiros. Ao clicar no botão abaixo, todas as suas dívidas, orçamentos, registros de pagamentos e simulações salvas no Cloud Firestore serão apagados permanentemente.
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="danger" onClick={handleDeleteAllDataAndAccount} isLoading={loadingDelete}>
            Excluir Minha Conta e Todos os Dados
          </Button>
          <Button variant="outline" onClick={logout}>
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}