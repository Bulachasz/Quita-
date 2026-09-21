import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export default function AuthPage() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgot) {
        await resetPassword(email);
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      } else if (isRegister) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Erro ao conectar com a conta Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-2xl text-white mx-auto shadow-lg shadow-indigo-500/30">
            Q+
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">QUITA+</h1>
          <p className="text-xs text-gray-500">Seu Auxiliador Financeiro Inteligente</p>
        </div>

        {error && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}
        {message && <div className="p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">{message}</div>}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 border border-gray-300 rounded-xl font-semibold text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Entrar com Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">ou</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && !isForgot && (
            <Input label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {!isForgot && (
            <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            {isForgot ? 'Enviar E-mail' : isRegister ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 space-y-2 pt-2">
          {!isForgot && (
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-indigo-600 font-semibold hover:underline block w-full"
            >
              {isRegister ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre-se gratuitamente'}
            </button>
          )}
          <button
            onClick={() => { setIsForgot(!isForgot); setError(''); setMessage(''); }}
            className="text-gray-400 hover:text-gray-600 block w-full"
          >
            {isForgot ? 'Voltar para o Login' : 'Esqueceu a senha?'}
          </button>
        </div>
      </div>
    </div>
  );
}