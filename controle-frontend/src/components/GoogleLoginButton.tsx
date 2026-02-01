import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "../api/auth.api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      console.log("Credential Response:", credentialResponse);
      if (credentialResponse.credential) {
        // Envia o JWT (id_token) direto para o backend
        const response = await authApi.googleLogin(credentialResponse.credential);
        login(response);
        navigate("/pessoas");
      }
    } catch (error: any) {
      console.error("Erro no login Google:", error);
      const msg = error.response?.data?.message || "Erro ao autenticar com Google";
      alert(msg);
    }
  };

  const handleError = () => {
    console.error("Login com Google falhou");
    alert("Falha ao iniciar sessão com Google");
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
}
