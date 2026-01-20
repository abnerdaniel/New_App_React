import { useEffect, useState } from "react";
import { pessoaApi } from "../../api/pessoas.api";
import type { Pessoa } from "../../types/Pessoa";
import { PessoasForm } from "./PessoasForm";
import { PessoasList } from "./PessoasList";

export function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);

  async function listarPessoas() {
    setLoading(true);
    console.log("Listando pessoas...");
    try {
      const response = await pessoaApi.listar();
      setPessoas(response);
    } catch (error) {
      console.error("Erro ao listar pessoas:", error);//tirar
    } finally {
      setLoading(false);
    }
  }

  async function handleCriar(nome: string, idade: number) {
    try {
      await pessoaApi.criar({ nome, idade });
      await listarPessoas();
    } catch (error) {
      console.error("Erro ao criar pessoa:", error);//tirar
    }
  }

  async function handleDeletar(id: number) {
    try {
      await pessoaApi.deletar(id);
      await listarPessoas();
    } catch (error) {
      console.error("Erro ao deletar pessoa:", error);//tirar
    }
  }


  useEffect(() => {
    listarPessoas();
  }, []);

  return (
  <div>
    <h2>
      Pessoas
    </h2>
    <PessoasForm onSubmit={handleCriar} />
    {loading ?  (<p>Carregando...</p>) : (<PessoasList pessoas={pessoas} onDelete={handleDeletar} />)}
  </div>)
}
