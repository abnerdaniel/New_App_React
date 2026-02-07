import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { Loja } from '../types';
import { lojaService } from '../services/loja.service';
import { StoreCard } from '../components/StoreCard';

export function Home() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    lojaService.getAll().then(data => {
      setLojas(data);
      setLoading(false);
    });
  }, []);

  const filteredLojas = lojas.filter(l => 
    (l.nome?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (l.categoria?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">O que vamos pedir hoje?</h1>
            <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Buscar lojas, lanches, bebidas..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-red-500 transition-all bg-white shadow-sm placeholder:text-gray-400"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </header>

        {/* Lojas List */}
        <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Lojas Disponíveis</h2>
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLojas.map(loja => (
                        <StoreCard 
                            key={loja.id} 
                            loja={loja} 
                            onClick={(id) => console.log('Navigate to store', id)} 
                        />
                    ))}
                </div>
            )}
            
            {!loading && filteredLojas.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
                    <p>Nenhuma loja encontrada para sua busca.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
