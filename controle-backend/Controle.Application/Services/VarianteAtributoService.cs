using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Domain.Entities;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class VarianteAtributoService
    {
        private readonly AppDbContext _context;

        public VarianteAtributoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<VarianteAtributoDTO>> ListarPorLojaAsync(Guid lojaId)
        {
            return await _context.VarianteAtributos
                .Where(a => a.LojaId == lojaId)
                .Include(a => a.Valores)
                .OrderBy(a => a.Nome)
                .Select(a => new VarianteAtributoDTO
                {
                    Id = a.Id,
                    Nome = a.Nome,
                    Valores = a.Valores.Select(v => new VarianteAtributoValorDTO
                    {
                        Id = v.Id,
                        Valor = v.Valor,
                        CodigoHex = v.CodigoHex
                    }).ToList()
                })
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<VarianteAtributoDTO> CriarAsync(Guid lojaId, CreateVarianteAtributoRequest dto)
        {
            var atributo = new VarianteAtributo { LojaId = lojaId, Nome = dto.Nome };
            _context.VarianteAtributos.Add(atributo);
            await _context.SaveChangesAsync();
            return new VarianteAtributoDTO { Id = atributo.Id, Nome = atributo.Nome };
        }

        public async Task<VarianteAtributoValorDTO> AddValorAsync(int atributoId, AddVarianteAtributoValorRequest dto)
        {
            var valor = new VarianteAtributoValor
            {
                VarianteAtributoId = atributoId,
                Valor = dto.Valor,
                CodigoHex = dto.CodigoHex
            };
            _context.VarianteAtributoValores.Add(valor);
            await _context.SaveChangesAsync();
            return new VarianteAtributoValorDTO { Id = valor.Id, Valor = valor.Valor, CodigoHex = valor.CodigoHex };
        }

        public async Task<bool> RemoverAtributoAsync(int id)
        {
            var atributo = await _context.VarianteAtributos.FindAsync(id);
            if (atributo == null) return false;
            _context.VarianteAtributos.Remove(atributo);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoverValorAsync(int id)
        {
            var valor = await _context.VarianteAtributoValores.FindAsync(id);
            if (valor == null) return false;
            _context.VarianteAtributoValores.Remove(valor);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
