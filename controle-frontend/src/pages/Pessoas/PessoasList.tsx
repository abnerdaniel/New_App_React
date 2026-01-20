import type { Pessoa } from "../../types/Pessoa";

interface Props {
  pessoas: Pessoa[];
  onDelete: (id: number) => void;
}

export function PessoasList({ pessoas, onDelete }: Props) {
  if (pessoas.length === 0) {
    return <p>Nenhuma pessoa cadastrada.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Idade</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {pessoas.map((pessoa) => (
          <tr key={pessoa.id}>
            <td>{pessoa.nome}</td>
            <td>{pessoa.idade}</td>
            <td>
              <button onClick={() => onDelete(pessoa.id)}>
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
