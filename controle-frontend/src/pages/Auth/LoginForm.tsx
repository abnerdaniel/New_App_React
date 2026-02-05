import { useState } from "react";

interface Props {
  onSubmit: (login: string, password: string) => void;
  loading: boolean;
}

export function LoginForm({ onSubmit, loading }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) return;

    onSubmit(email, password);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email ou Login</label>
        <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-base text-gray-900 placeholder-gray-400 bg-white"
            placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Senha</label>
            <a href="#" className="text-xs text-brand-primary font-medium hover:underline">Esqueceu?</a>
        </div>
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-base text-gray-900 placeholder-gray-400 bg-white"
            placeholder="••••••••"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 bg-brand-primary text-white rounded-lg font-bold text-base hover:bg-brand-hover active:scale-[0.98] transition-all shadow-md shadow-brand-primary/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
            </span>
        ) : "Entrar"}
      </button>
    </form>
  );
}
