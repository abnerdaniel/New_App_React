import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useAuth } from "../../contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { GoogleLoginButton } from "../../components/GoogleLoginButton";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(loginData: string, password: string) {
    setLoading(true);
    setError("");
    
    try {
      const response = await authApi.login({ login: loginData, password });
      login(response);
      
      // Verifica se precisa de setup
      // Verifica se precisa de setup (não tem lojas E não é funcionário de nenhuma loja)
      const isEmployee = response.funcionarios && response.funcionarios.length > 0;
      const hasStores = response.lojas.length > 0 && response.lojas[0].nome !== "Nova Loja";

      if (!hasStores && !isEmployee) {
        navigate("/setup");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);
      setError(err.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(nome: string, email: string, password: string) {
    setLoading(true);
    setError("");
    
    try {
      const response = await authApi.register({ nome, email, password });
      login(response);
      navigate("/pessoas");
    } catch (err: any) {
      console.error("Erro ao fazer registro:", err);
      setError(err.response?.data?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-brand-primary p-6 text-center">
             <h1 className="text-2xl font-bold text-white tracking-tight">
               LanchoneteUI
             </h1>
             <p className="text-white/80 text-sm mt-1">Sistema de Controle</p>
        </div>
        
        <div className="p-8">
            <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
            <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin 
                    ? "bg-white text-brand-primary shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                setIsLogin(true);
                setError("");
                }}
            >
                Entrar
            </button>
            <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin 
                    ? "bg-white text-brand-primary shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                setIsLogin(false);
                setError("");
                }}
            >
                Conta
            </button>
            </div>
            
            <div className="mb-6">
                <GoogleLoginButton />
            </div>
            
            <div className="relative mb-8 pt-2">
                <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-semibold text-gray-400 uppercase">
                    ou email
                </span>
                </div>
            </div>

            {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 mb-6">
                {error}
            </div>
            )}

            {isLogin ? (
            <LoginForm onSubmit={handleLogin} loading={loading} />
            ) : (
            <RegisterForm onSubmit={handleRegister} loading={loading} />
            )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>Desenvolvido por <span className="font-bold text-gray-500">Help me Here</span></p>
        <div className="flex justify-center gap-4 mt-2">
            <a href="https://wa.me/5521991680708" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                Suporte (21) 99168-0708
            </a>
            <span className="text-gray-300">|</span>
            <a href="http://www.helpmehere.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                www.helpmehere.com.br
            </a>
        </div>
      </div>
    </div>
  );
}
