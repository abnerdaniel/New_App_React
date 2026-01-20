import type { PessoaTotais } from './PessoaTotais'

export interface ConsultaTotaisResponse {
  pessoas: PessoaTotais[];
  valorTotalGeralDespesa: number;
  valorTotalGeralReceita: number;
  saldoGeral: number;
}
