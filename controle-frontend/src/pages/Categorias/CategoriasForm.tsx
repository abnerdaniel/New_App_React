import { useState } from "react";
import type { Categoria } from "../../types/Categoria";

interface Props {
  onSubmit: (descricao: string, finalidade: Categoria["finalidade"]) => void;
}

export function CategoriasForm({ onSubmit }: Props) {
  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] =
    useState<Categoria["finalidade"]>("despesa");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!descricao) return;

    onSubmit(descricao, finalidade);
    setDescricao("");
    setFinalidade("despesa");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <select
        value={finalidade}
        onChange={(e) =>
          setFinalidade(e.target.value as Categoria["finalidade"])
        }
      >
        <option value="despesa">Despesa</option>
        <option value="receita">Receita</option>
        <option value="ambas">Ambas</option>
      </select>

      <button type="submit">Adicionar</button>
    </form>
  );
}
