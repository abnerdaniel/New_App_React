import { type Transacao } from "../../types/Transacao";

interface Props {
    transacoes: Transacao[];
    onDelete: (id: number) => void;
}

export function TransacoesList({ transacoes, onDelete }: Props) {
    if(transacoes.length === 0){
        return <p>Nenhuma transação encontrada.</p>;
    }
    return (
        <table>
        <thead>
            <tr>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Tipo</th>
            <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            {transacoes.map((t) => (
            <tr key={t.id}>
                <td>{t.descricao}</td>
                <td>{t.valor.toFixed(2)}</td>
                <td>{t.tipo}</td>
                <td>
                <button onClick={() => onDelete(t.id)}>Excluir</button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    );
}