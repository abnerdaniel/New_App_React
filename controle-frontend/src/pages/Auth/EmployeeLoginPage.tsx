import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiter } from '../../contexts/WaiterContext';
import { ChefHat, User, Lock, ArrowRight } from 'lucide-react';

export function EmployeeLoginPage() {
    const navigate = useNavigate();
    const { login, waiterUser, logout } = useWaiter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            console.error(err);
            setError('Login falhou. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    if (waiterUser) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md md:max-w-2xl text-center transition-all duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo, {waiterUser.nome}!</h2>
                    <p className="text-gray-500 mb-8">Selecione seu perfil de acesso:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={() => navigate('/garcom')}
                            className="flex flex-col items-center justify-center p-8 border-2 border-blue-100 bg-blue-50 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all group aspect-square md:aspect-auto md:h-64"
                        >
                            <div className="bg-white p-6 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <User size={48} className="text-blue-600" />
                            </div>
                            <span className="font-bold text-blue-800 text-lg">Garçom / Salão</span>
                        </button>

                        <button 
                            onClick={() => navigate('/cozinha')}
                            className="flex flex-col items-center justify-center p-8 border-2 border-red-100 bg-red-50 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all group aspect-square md:aspect-auto md:h-64"
                        >
                            <div className="bg-white p-6 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <ChefHat size={48} className="text-red-600" />
                            </div>
                            <span className="font-bold text-red-800 text-lg">Cozinha / Bar</span>
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <button onClick={logout} className="text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center gap-2 mx-auto">
                           <ArrowRight className="rotate-180" size={16} /> Sair / Trocar Usuário
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4 text-gray-700">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Acesso Funcionário</h1>
                    <p className="text-gray-500">Área restrita para equipe</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
                        <input 
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Usuario"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded text-center">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg font-bold hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Entrando...' : (
                            <>
                                Acessar <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
