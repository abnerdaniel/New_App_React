import type { Categoria } from "../../types/Categoria";

interface Props {
  categorias: Categoria[];
}

export function CategoriasList({ categorias }: Props) {
  if (categorias.length === 0) {
    return <p>Nenhuma categoria cadastrada.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Finalidade</th>
        </tr>
      </thead>
      <tbody>
        {categorias.map((categoria) => (
          <tr key={categoria.id}>
            <td>{categoria.descricao}</td>
            <td>{categoria.finalidade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
