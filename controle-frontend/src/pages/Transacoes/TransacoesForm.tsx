import { useMemo, useState } from "react";
import type { TipoTransacao } from "../../types/Transacao";
import type { Categoria } from "../../types/Categoria";
import type { Pessoa } from "../../types/Pessoa";


interface Props {
  pessoa: Pessoa;
  categorias: Categoria[];
  onSubmit: (
    descricao: string,
    valor: number,
    tipo: TipoTransacao,
    categoriaId: number
  ) => void;
}


export function TransacoesForm({pessoa,categorias, onSubmit}: Props){
    const [valor, setValor] = useState<number>(0);
    const [descricao, setDescricao] = useState("");
    const [tipo, setTipo] = useState<TipoTransacao>("despesa");
    const [categoriaId, setCategoriaId] = useState<number>();

    const tiposDisponiveis: TipoTransacao[] = pessoa.idade < 18 ? ["despesa"] : ["despesa", "receita"];// garantia da regra de 18 anos

    const categoriasDisponiveis = useMemo(() => {
      return categorias.filter((categoria) => categoria.finalidade === "ambas" || categoria.finalidade === tipo);
    }, [categorias, tipo]);

    function handleSubmit(event: React.FormEvent) {
      event.preventDefault();

      if (!descricao || valor <= 0 || !categoriaId) {
        return;
      }
      onSubmit(descricao, valor, tipo, categoriaId);

      setDescricao("");
      setValor(0);
      setCategoriaId(undefined);
      setTipo("despesa");

    }

    return (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoTransacao)}
        >
          {tiposDisponiveis.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(Number(e.target.value))}
        >
          {categoriasDisponiveis.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.descricao} 
            </option>
          ))}
        </select>
        <button type="submit">Salvar</button>
      </form>
    );
}