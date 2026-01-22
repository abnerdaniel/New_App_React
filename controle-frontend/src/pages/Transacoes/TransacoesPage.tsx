import { useEffect, useState } from 'react'
import { transacaoApi } from '../../api/transacoes.api'
import { categoriaApi } from '../../api/categorias.api'
import { pessoaApi } from '../../api/pessoas.api'
import { TransacoesList } from './TransacoesList'
import { TransacoesForm } from './TransacoesForm'
import type { Pessoa } from '../../types/Pessoa'
import type { Transacao, TipoTransacao } from '../../types/Transacao'
import type { Categoria } from '../../types/Categoria'



export function TransacoesPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  
  async function carregarDadosIniciais() {
      const [pessoasData, categoriasData] = await Promise.all([
        pessoaApi.listar(), 
        categoriaApi.listar()
      ]);

      setPessoas(pessoasData);
      setCategorias(categoriasData);
  }
  
  async function loadTransacoes(pessoaId: number) {
    setLoading(true);
    try {
      const data = await transacaoApi.listarPorPessoa(pessoaId);
      setTransacoes(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCriar(descricao: string, valor: number, tipo: TipoTransacao, categoriaId: number) {
    if (!pessoaSelecionada) return;
    try {
    await transacaoApi.criar({descricao, valor, tipo, categoriaId, pessoaId: pessoaSelecionada.id});
    loadTransacoes(pessoaSelecionada.id)
    } catch  {
      alert("Erro ao criar transação");
    }
  }

  async function handleDeletar(id: number) {
    if (!pessoaSelecionada) return;

    await transacaoApi.deletar(id);
    await loadTransacoes(pessoaSelecionada.id);
  }


  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (!pessoaSelecionada) {
      setTransacoes([]);
      return;
    }
    
    setTransacoes([]);
    loadTransacoes(pessoaSelecionada.id);
  }, [pessoaSelecionada]);

  return (
    <div>
      <h2>Transações</h2>
      <select
        value={pessoaSelecionada?.id ?? ""}
        onChange={(e) => {
          const pessoa = pessoas.find(p => p.id === Number(e.target.value));
          setPessoaSelecionada(pessoa ?? null);
        }}
      >
        <option value="">Selecione uma pessoa</option>
        {pessoas.map(p => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>

      
      {pessoaSelecionada && (
        <>
          <h3>Transações de {pessoaSelecionada.nome}</h3>

          <TransacoesForm
            onSubmit={handleCriar}
            pessoa={pessoaSelecionada}
            categorias={categorias}
          />

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <TransacoesList
              transacoes={transacoes}
              onDelete={handleDeletar}
            />
          )}
        </>
      )}
    </div>
  );
}
