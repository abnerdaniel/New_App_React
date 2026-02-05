import { useState } from "react";

interface Props {
  onSubmit: (nome: string, email: string, password: string) => void;
  loading: boolean;
}

export function RegisterForm({ onSubmit, loading }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nome || !email || !password || !confirmPassword) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    onSubmit(nome, email, password);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
          {error}
        </div>
      )}
      
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome Completo</label>
        <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={loading}
            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-900 bg-white"
            placeholder="Seu nome"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-900 bg-white"
            placeholder="seu@email.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Senha</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-900 bg-white"
                placeholder="••••••"
            />
        </div>

        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirmar</label>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-gray-900 bg-white"
                placeholder="••••••"
            />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 bg-brand-primary text-white rounded-lg font-bold text-base hover:bg-brand-hover active:scale-[0.98] transition-all shadow-md shadow-brand-primary/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
