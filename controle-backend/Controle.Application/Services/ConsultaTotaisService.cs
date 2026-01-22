using Controle.Application.DTOs;
using Controle.Domain.Entities;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;


namespace Controle.Application.Services
{
    public class ConsultaTotaisService : IConsultaTotaisService
    {
        private readonly ITransacaoRepository _transacaoRepo;
        private readonly IPessoaRepository _pessoaRepo;

        public ConsultaTotaisService(ITransacaoRepository transacaoRepo, IPessoaRepository pessoaRepo)
        {
            _transacaoRepo = transacaoRepo;
            _pessoaRepo = pessoaRepo;
        }
        public async Task<ListaPessoasResponse?> ConsultaTotalPorPessoa()
        {
            ListaPessoasResponse lista = new ListaPessoasResponse();
            var pessoas = await _pessoaRepo.GetAllAsync();
            foreach (var pessoa in pessoas)
            {
                var transacoesDespesa = await _transacaoRepo.GetAllTipoByPessoaIdAsync(pessoa.Id, "despesa");
                var transacoesReceita = await _transacaoRepo.GetAllTipoByPessoaIdAsync(pessoa.Id, "receita");

                int totalReceita = (int)transacoesReceita.Sum(t => t.Valor);
                int totalDespesa = (int)transacoesDespesa.Sum(t => t.Valor);
                lista.Pessoas.Add(new Integrante
                {
                    Id = pessoa.Id,
                    Nome = pessoa.Nome,
                    Idade = pessoa.Idade,
                    ValorTotalDespesa = totalDespesa,
                    ValorTotalReceita = totalReceita,
                    Saldo = totalReceita - totalDespesa
                });
                lista.ValorTotalGeralDespesa += totalDespesa;
                lista.ValorTotalGeralReceita += totalReceita;
            }
            lista.SaldoGeral = lista.ValorTotalGeralReceita - lista.ValorTotalGeralDespesa;
            return lista;
        }
    }
}