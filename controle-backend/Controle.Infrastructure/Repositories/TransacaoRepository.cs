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
    public class TransacaoRepository :ITransacaoRepository
    {
        private readonly AppDbContext _context;
        public TransacaoRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Transacao transacao)
        {
            await _context.Transacoes.AddAsync(transacao);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var uso = _context.Transacoes.Find(id);
            if (uso != null)
            {
                _context.Transacoes.Remove(uso);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Transacao>> GetAllAsync()
        {
            return await _context.Transacoes.ToListAsync();
        }
        public async Task<IEnumerable<Transacao?>> GetAllByPessoaIdAsync(int pessoaId)
        {
            return await _context.Transacoes
                .Where(t => t.PessoaId == pessoaId)
                .ToListAsync();
        }

        public async Task<Transacao?> GetByIdAsync(int id)
        {
            return await _context.Transacoes.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdateAsync(Transacao transacao)
        {
            _context.Transacoes.Update(transacao);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteByPessoaIdAsync(int pessoaId)
        {
            var transacoes = await _context.Transacoes
                .Where(t => t.PessoaId == pessoaId)
                .ToListAsync();

            if (!transacoes.Any())
                return;

            _context.Transacoes.RemoveRange(transacoes);
            await _context.SaveChangesAsync();
        }


        public async Task<IEnumerable<Transacao?>> GetAllTipoByPessoaIdAsync(int id, string tipo)
        {
            return await _context.Transacoes
                .Where(t => t.PessoaId == id && t.Tipo == tipo)
                .ToListAsync();
        }

    }
}