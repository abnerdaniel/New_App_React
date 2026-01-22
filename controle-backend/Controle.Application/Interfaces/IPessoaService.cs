using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;
using Controle.Application.Services;

namespace Controle.Application.Interfaces
{
    public interface IPessoaService
    {
        Task<Result> CriarPessoaAsync(Pessoa pessoa);
        Task<Pessoa> ObterPessoaPorIdAsync(int id);
        Task<Pessoa> ObterPessoaPorNomeAsync(string nome);
        Task<IEnumerable<Pessoa>> ObterTodasPessoasAsync();
        Task<Result> AtualizarPessoaAsync(Pessoa pessoa);
        Task<Result> DeletarPessoaAsync(int id);
    }
}