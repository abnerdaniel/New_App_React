import { useState } from "react";

interface Props {
  onSubmit: (nome: string, idade: number) => void;
}

export function PessoasForm({ onSubmit }: Props) {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !idade) return;

    onSubmit(nome, Number(idade));

    setNome("");
    setIdade("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <input
        type="number"
        placeholder="Idade"
        value={idade}
        onChange={(e) => setIdade(e.target.value)}
      />

      <button type="submit">Adicionar</button>
    </form>
  );
}
