import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useClientAuth } from '../context/ClientAuthContext';
import { ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';

export function Identificacao() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loginWithGoogle } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Dados de Cadastro
  const [nome, setNome] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ nome, email, password, telefone: phone });
      }
      
      // Redireciona de volta para onde estava (geralmente carrinho)
      const from = location.state?.from?.pathname || '/carrinho';
      navigate(from, { replace: true });
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      
      const from = location.state?.from?.pathname || '/carrinho';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao fazer login com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Erro ao fazer login com Google.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-gray-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary p-6 text-white text-center relative">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute left-4 top-6 text-white hover:text-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Identifique-se</h2>
          <p className="text-sm opacity-90 mt-1">
            Para finalizar seu pedido, precisamos saber quem é você.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              isLogin ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Já tenho conta
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              !isLogin ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Quero cadastrar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-gray-900 bg-white"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Celular</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 2) {
                        setPhone(value);
                      } else if (value.length <= 7) {
                        setPhone(`(${value.substring(0, 2)}) ${value.substring(2)}`);
                      } else {
                        setPhone(`(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`);
                      }
                    }}
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-gray-900 bg-white"
                    placeholder="(99) 99999-9999"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-gray-900 bg-white"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-gray-900 bg-white"
                placeholder="******"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-secondary transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar e Continuar')}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continue com</span>
            </div>
          </div>

          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="continue_with"
              shape="rectangular"
              size="large"
              width="100%"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
