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

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    setError("");
    
    try {
      const response = await authApi.login({ email, password });
      login(response);
      navigate("/pessoas");
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
    <div className="login-container">
      <div className="login-box">
        <h1>Sistema de Controle</h1>
        
        <div className="login-tabs">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Registrar
          </button>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
             <GoogleLoginButton />
        </div>
        
        <div style={{ textAlign: 'center', margin: '10px 0', color: '#666', fontSize: '0.9rem' }}>
             ou continue com email
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLogin ? (
          <LoginForm onSubmit={handleLogin} loading={loading} />
        ) : (
          <RegisterForm onSubmit={handleRegister} loading={loading} />
        )}
      </div>
    </div>
  );
}
