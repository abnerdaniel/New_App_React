import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';

interface VitrineDTO {
    lojaId: string;
    nomeLoja: string;
    aberta: boolean;
    cardapio: CardapioDTO | null;
}

interface CardapioDTO {
    id: number;
    nome: string;
    categorias: CategoriaDTO[];
}

interface CategoriaDTO {
    id: number;
    nome: string;
    produtos: ProdutoLojaDTO[];
    combos: ComboDTO[];
}

interface ProdutoLojaDTO {
    id: number;
    nome: string;
    descricao: string;
    preco: number; // decimal matches number in JS
    urlImagem: string;
    esgotado: boolean;
}

interface ComboDTO {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    imagemUrl: string;
    ativo: boolean;
    itens: ComboItemDTO[];
}

interface ComboItemDTO {
    id: number;
    nomeProduto: string;
    quantidade: number;
}

export function VitrinePage() {
    const { lojaId } = useParams();
    const [vitrine, setVitrine] = useState<VitrineDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (lojaId) {
            loadVitrine();
        }
    }, [lojaId]);

    async function loadVitrine() {
        try {
            setLoading(true);
            const response = await api.get(`/vitrine/${lojaId}`);
            setVitrine(response.data);
        } catch (error) {
            console.error('Erro ao carregar vitrine:', error);
            setError('Não foi possível carregar a vitrine. Verifique o link ou tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-8 text-center">Carregando cardápio...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!vitrine) return <div className="p-8 text-center">Loja não encontrada.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Capa */}
            <div className="bg-brand-primary h-40 flex items-center justify-center">
                <h1 className="text-3xl font-bold text-white">{vitrine.nomeLoja}</h1>
            </div>

            <div className="container mx-auto px-4 -mt-10">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${vitrine.aberta ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {vitrine.aberta ? 'ABERTO' : 'FECHADO'}
                        </span>
                        <span>{vitrine.cardapio?.nome}</span>
                    </div>
                </div>

                {/* Categorias */}
                {vitrine.cardapio?.categorias.map(categoria => (
                    <div key={categoria.id} className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{categoria.nome}</h2>
                        
                        {/* Combos da Categoria */}
                        {categoria.combos?.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {categoria.combos.map(combo => (
                                    <div key={combo.id} className="bg-white p-4 rounded-lg shadow flex border border-yellow-200">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                 <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded">COMBO</span>
                                                 <h3 className="font-bold text-lg">{combo.nome}</h3>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-1">{combo.descricao}</p>
                                            <p className="text-brand-primary font-bold mt-2">
                                                {(combo.preco / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                        {combo.imagemUrl && (
                                            <img src={combo.imagemUrl} alt={combo.nome} className="w-24 h-24 object-cover rounded ml-4" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Produtos da Categoria */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoria.produtos.map(produto => (
                                <div key={produto.id} className={`bg-white p-4 rounded-lg shadow flex ${produto.esgotado ? 'opacity-60' : ''}`}>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold text-lg">{produto.nome}</h3>
                                            {produto.esgotado && <span className="text-red-500 text-xs font-bold">ESGOTADO</span>}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{produto.descricao}</p>
                                        <p className="text-gray-900 font-bold mt-2">
                                            {(produto.preco / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                    </div>
                                    {produto.urlImagem && (
                                        <img src={produto.urlImagem} alt={produto.nome} className="w-24 h-24 object-cover rounded ml-4" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
