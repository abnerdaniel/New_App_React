using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;

namespace Controle.Application.Services
{
    public class TransacaoService : ITransacaoService
    {
        private readonly ITransacaoRepository _transacaoRepo;
        private readonly ICategoriaRepository _categoriaRepo;
        private readonly IPessoaRepository _pessoaRepo;

        public TransacaoService(ITransacaoRepository transacaoRepo, ICategoriaRepository categoriaRepo, IPessoaRepository pessoaRepo)
        {
            _transacaoRepo = transacaoRepo;
            _categoriaRepo = categoriaRepo;
            _pessoaRepo = pessoaRepo;
        }

        public async Task<Result> CriarTransacaoAsync(Transacao transacao)
        {
            var pessoa = await _pessoaRepo.GetByIdAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return Result.Fail("Pessoa não encontrada.");
            }
            var categoria = await _categoriaRepo.GetByIdAsync(transacao.CategoriaId);
            if (categoria == null)  
            {
                return Result.Fail("categoriaId não encontrada ou nao cadastrada.");
            }
            if (pessoa.Idade <= 18 && transacao.Tipo != "despesa")
            {
                return Result.Fail("Menores de idade so podem registrar despesas.");
            }
            var valoresValidos = new List<string> { "despesa", "receita" };
            if (!valoresValidos.Contains(transacao.Tipo.ToLower()))
            {
                return Result.Fail("Tipo de transação inválida. Os valores permitidos são: despesa, receita.");
            }
            if (transacao.Tipo != categoria.Finalidade && categoria.Finalidade != "ambas")
            {
                return Result.Fail("O tipo da transação não pode ser diferente da finalidade da categoria ou finalidade da categoria deve ser ambas.");
            }
            transacao.Pessoa = pessoa;
            transacao.Categoria = categoria;
            await _transacaoRepo.AddAsync(transacao);
            return Result.Ok();
        }   
        public async Task<Transacao> ObterTransacaoPorIdAsync(int id)
        {
            return await _transacaoRepo.GetByIdAsync(id);
        }
        public async Task<IEnumerable<Transacao>> ObterTodasTransacoesPorPessoaIdAsync(int id)
        {
            return await _transacaoRepo.GetAllByPessoaIdAsync(id);
        }
        public async Task<IEnumerable<Transacao>> ObterTodasTransacoesAsync()
        {
            return await _transacaoRepo.GetAllAsync();
        }
        public async Task<Result> AtualizarTransacaoAsync(Transacao transacao)
        {
            await _transacaoRepo.UpdateAsync(transacao); 
            return Result.Ok();
        }
        public async Task<Result> DeletarTransacaoAsync(int id)
        {
            await _transacaoRepo.DeleteAsync(id);
            return Result.Ok();
        }
    }
}