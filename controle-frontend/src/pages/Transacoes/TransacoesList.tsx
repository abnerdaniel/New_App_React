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
                    <td>{(t.valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td><span className={`badge ${t.tipo}`}>{t.tipo}</span></td>
                    <td>
                        <button className="btn-delete" onClick={() => onDelete(t.id)}>Excluir</button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    );
}