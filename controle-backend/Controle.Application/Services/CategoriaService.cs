using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;
using Controle.Application.Interfaces;
using Controle.Domain.Interfaces;

namespace Controle.Application.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly ICategoriaRepository _repository;

        public CategoriaService(ICategoriaRepository repository)
        {
            _repository = repository;
        }
        public async Task<Result> CriarCategoriaAsync(Categoria categoria)
        {
            var valoresValidos = new List<string> { "despesa", "receita", "ambas" };
            if (!valoresValidos.Contains(categoria.Finalidade.ToLower()))
            {
                return Result.Fail("Tipo de finalidade inválida. Os valores permitidos são: despesa, receita, ambas.");
            }
            await _repository.AddAsync(categoria);
            return Result.Ok();
        }
        public async Task<Categoria> ObterCategoriaPorIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }
        public async Task<IEnumerable<Categoria>> ObterTodasCategoriasAsync()
        {
            return await _repository.GetAllAsync();
        }
        public async Task<Result> AtualizarCategoriaAsync(Categoria categoria)
        {
            await _repository.UpdateAsync(categoria);
            return Result.Ok();
        }
        public async Task<Result> DeletarCategoriaAsync(int id)
        {
            await _repository.DeleteAsync(id);
            return Result.Ok();
        }
    }
}