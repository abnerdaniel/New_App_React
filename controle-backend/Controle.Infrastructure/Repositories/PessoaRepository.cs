using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Controle.Domain.Entities;
using Controle.Domain.Interfaces;
using Controle.Infrastructure.Data;

namespace Controle.Infrastructure.Repositories
{
    public class PessoaRepository : IPessoaRepository
    {
        private readonly AppDbContext _context;
        public PessoaRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Pessoa pessoa)
        {
            await _context.Pessoas.AddAsync(pessoa);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var uso = _context.Pessoas.Find(id);
            if (uso != null)
            {
                _context.Pessoas.Remove(uso);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Pessoa>> GetAllAsync()
        {
            return await _context.Pessoas.ToListAsync();
        }

        public async Task<Pessoa?> GetByIdAsync(int id)
        {
            return await _context.Pessoas.FirstOrDefaultAsync(p => p.Id == id);
        }
        public async Task<Pessoa?> GetByNomeAsync(string nome)
        {
            return await _context.Pessoas.FirstOrDefaultAsync(p => p.Nome == nome);
        }

        public async Task UpdateAsync(Pessoa pessoa)
        {
            var existingPessoa = await _context.Pessoas.FindAsync(pessoa.Id);
            if (existingPessoa == null)
                return; 

            existingPessoa.Nome = pessoa.Nome;
            existingPessoa.Idade = pessoa.Idade;

            await _context.SaveChangesAsync();
        }
    }
}