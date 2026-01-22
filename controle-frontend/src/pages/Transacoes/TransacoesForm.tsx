
import { useMemo, useState} from "react";
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
    const [categoriaId, setCategoriaId] = useState<number | null>(null);

    const tiposDisponiveis: TipoTransacao[] = pessoa.idade < 18 ? ["despesa"] : ["despesa", "receita"];// garantia da regra de 18 anos

    const categoriasDisponiveis = useMemo(() => {
      return categorias.filter((categoria) => categoria.finalidade === "ambas" || categoria.finalidade === tipo);
    }, [categorias, tipo]);

    const idEfetivo = useMemo(() => {
        if (categoriaId && categoriasDisponiveis.some(c => c.id === categoriaId)) {
        return categoriaId;
        }
        return categoriasDisponiveis.length > 0 ? categoriasDisponiveis[0].id : null;
    }, [categoriaId, categoriasDisponiveis]);

    
    function handleSubmit(event: React.FormEvent) {
      event.preventDefault();

      if (!descricao || valor <= 0 || idEfetivo === null) {
        alert("Preencha todos os campos corretamente.");
        return;
      }

      const valorEmCentavos = Math.round(valor * 100);

      onSubmit(descricao, valorEmCentavos, tipo, idEfetivo);

      setDescricao("");
      setValor(0);
      setCategoriaId(null);

    }

    return (
      <form onSubmit={handleSubmit} className="form-container">
        <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <div className="input-group">
            <span>R$ </span>
            <input type="number" step="0.01" placeholder="0.00" value={valor || ""} onChange={(e) => setValor(Number(e.target.value))}/>
        </div>
        <label>Tipo: </label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoTransacao)}>
          {tiposDisponiveis.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <label> Categoria: </label>
        <select value={categoriaId ?? ""} onChange={(e) => setCategoriaId(Number(e.target.value))}>
          {categoriasDisponiveis.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.descricao} 
            </option>
          ))}
        </select>
        <button type="submit" className="btn-save">Salvar</button>
      </form>
    );
}