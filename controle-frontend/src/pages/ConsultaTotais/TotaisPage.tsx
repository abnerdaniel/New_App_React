import { totaisApi } from "../../api/totais.api";
import { useEffect, useState } from "react";
import type { ConsultaTotaisResponse } from "../../types/ConsultaTotaisResponse";


export function ConsultaTotaisPage() {
  const [dados, setDados] = useState<ConsultaTotaisResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function listar() {
    setCarregando(true);
    setErro(null);

    try {
      const response = await totaisApi.listar();
      setDados(response);
    } catch  {
      alert("Erro ao carregar dados");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    listar();
  }, []);

  if (carregando) {
    return <h2>Carregando...</h2>;
  }

  if (erro) {
    return <p style={{ color: "red" }}>{erro}</p>;
  }

  if (!dados) {
    return <p style={{ color: "red" }}>Nenhum dado encontrado</p>;
  }

  return (
    <div>
      <h2>Consulta de Totais por Pessoa</h2>

      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>Pessoa</th>
            <th>Receitas</th>
            <th>Despesas</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {dados.pessoas.map((pessoa) => (
            <tr key={pessoa.id}>
              <td>{pessoa.nome}</td>
              <td>{pessoa.valorTotalReceita.toFixed(2)}</td>
              <td>{pessoa.valorTotalDespesa.toFixed(2)}</td>
              <td
                style={{
                  color: pessoa.saldo < 0 ? "red" : "green",
                  fontWeight: "bold"
                }}
              >
                {pessoa.saldo.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <th>Total Geral</th>
            <th>{dados.valorTotalGeralReceita.toFixed(2)}</th>
            <th>{dados.valorTotalGeralDespesa.toFixed(2)}</th>
            <th
              style={{
                color: dados.saldoGeral < 0 ? "red" : "green",
                fontWeight: "bold"
              }}
            >
              {dados.saldoGeral.toFixed(2)}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}