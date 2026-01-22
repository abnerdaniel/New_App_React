using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;

namespace Controle.Application.Services
{
    public class PessoaService : IPessoaService 
    {
        private readonly IPessoaRepository _pessoarepo;
        private readonly ITransacaoRepository _transacaoRepo;

        public PessoaService(IPessoaRepository pessoarepo, ITransacaoRepository transacaoRepo)
        {
            _pessoarepo = pessoarepo;
            _transacaoRepo = transacaoRepo;

        }
        public async Task<Result> CriarPessoaAsync(Pessoa pessoa)
        {
            if (string.IsNullOrWhiteSpace(pessoa.Nome))
            {
                return Result.Fail("O nome da pessoa não pode ser vazio.");
            }
            await _pessoarepo.AddAsync(pessoa);
            return Result.Ok();
        }
        public async Task<Pessoa> ObterPessoaPorIdAsync(int id)
        {
            return await _pessoarepo.GetByIdAsync(id);
        }
        public async Task<Pessoa> ObterPessoaPorNomeAsync(string nome)
        {
            return await _pessoarepo.GetByNomeAsync(nome);
        }
        public async Task<IEnumerable<Pessoa>> ObterTodasPessoasAsync()
        {
            return await _pessoarepo.GetAllAsync();
        }
        public async Task<Result> AtualizarPessoaAsync(Pessoa pessoa)
        {
            await _pessoarepo.UpdateAsync(pessoa);
            return Result.Ok();
        }
        public async Task<Result> DeletarPessoaAsync(int id)
        {
            await _transacaoRepo.DeleteByPessoaIdAsync(id);
            await _pessoarepo.DeleteAsync(id);
            return Result.Ok();
        }
    }
}