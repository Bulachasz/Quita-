import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteAllUserData } from '../firebase/firestoreService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export default function SettingsPage() {
  const { user, changePassword, deleteAccount } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await changePassword(newPassword);
      setMsg('Senha alterada com sucesso!');
      setNewPassword('');
    } catch (error) {
      setErr(error.message || 'Erro ao alterar senha.');
    }
  };

  const handleDeleteAllData = async () => {
    if (window.confirm('TEM CERTEZA? Isso excluirá permanentemente todas as suas dívidas e simulações do Firestore.')) {
      try {
        await deleteAllUserData(user.uid);
        await deleteAccount();
      } catch (error) {
        alert('Erro ao excluir conta: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Configurações e Privacidade</h2>
        <p className="text-xs text-gray-500">Gerencie sua conta e controle total sobre seus dados</p>
      </div>

      {msg && <div className="p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl">{msg}</div>}
      {err && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl">{err}</div>}

      <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800 text-sm border-b pb-2">Alterar Senha</h3>
        <Input label="Nova Senha" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <Button type="submit">Atualizar Senha</Button>
      </form>

      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl space-y-3">
        <h3 className="font-bold text-red-800 text-sm">Zona de Perigo</h3>
        <p className="text-xs text-red-600">Ao clicar abaixo, todas as suas dívidas, cartões e dados cadastrados serão permanentemente apagados do servidor.</p>
        <Button onClick={handleDeleteAllData} variant="danger" size="sm">Excluir Minha Conta e Dados</Button>
      </div>
    </div>
  );
}