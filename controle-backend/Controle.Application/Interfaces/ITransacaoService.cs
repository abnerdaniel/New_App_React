using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;
using Controle.Application.Services;

namespace Controle.Application.Interfaces
{
    public interface ITransacaoService
    {
        Task<Result> CriarTransacaoAsync(Transacao transacao);
        Task<Transacao> ObterTransacaoPorIdAsync(int id);
        Task<IEnumerable<Transacao>> ObterTodasTransacoesAsync();
        Task<IEnumerable<Transacao>> ObterTodasTransacoesPorPessoaIdAsync(int id);
        Task<Result> AtualizarTransacaoAsync(Transacao transacao);
        Task<Result> DeletarTransacaoAsync(int id);
    }
}