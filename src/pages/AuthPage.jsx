import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export default function AuthPage() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isReset) {
        await resetPassword(email);
        alert("Instruções de recuperação de senha enviadas para o seu e-mail.");
        setIsReset(false);
      } else if (isRegister) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      alert(err.message || "Erro de autenticação. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-emerald-400 rounded-2xl flex items-center justify-center font-black text-2xl text-white mx-auto shadow-lg shadow-indigo-500/30">
            Q+
          </div>
          <h1 className="text-2xl font-black text-gray-900">QUITA+</h1>
          <p className="text-xs text-gray-500">Seu Auxiliador Financeiro Pessoal</p>
        </div>

        {/* Botão de Entrar com Google */}
        {!isReset && (
          <button
            onClick={loginWithGoogle}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>🌐</span> Continuar com o Google
          </button>
        )}

        {!isReset && (
          <div className="relative flex items-center justify-center">
            <div className="border-t w-full border-gray-200" />
            <span className="bg-white px-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider absolute">
              ou
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input
              label="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          )}

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@exemplo.com"
            required
          />

          {!isReset && (
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            {isReset ? 'Enviar Recuperação' : isRegister ? 'Criar Minha Conta' : 'Entrar na Conta'}
          </Button>
        </form>

        <div className="flex flex-col gap-2 text-center text-xs text-gray-500">
          {!isReset && (
            <button
              type="button"
              onClick={() => setIsReset(true)}
              className="hover:underline font-medium text-indigo-600"
            >
              Esqueceu sua senha?
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsReset(false);
              setIsRegister(!isRegister);
            }}
            className="hover:underline font-bold text-gray-800"
          >
            {isReset
              ? 'Voltar para o Login'
              : isRegister
              ? 'Já tem uma conta? Faça Login'
              : 'Não tem conta? Cadastre-se de graça'}
          </button>
        </div>
      </div>
    </div>
  );
}