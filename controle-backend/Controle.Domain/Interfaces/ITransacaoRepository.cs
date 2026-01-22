using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Controle.Domain.Entities;

namespace Controle.Domain.Interfaces
{
    public interface ITransacaoRepository
    {
        Task<IEnumerable<Transacao>> GetAllAsync();
        Task<IEnumerable<Transacao?>> GetAllByPessoaIdAsync(int id);
        Task<IEnumerable<Transacao?>> GetAllTipoByPessoaIdAsync(int id, string tipo);
        Task<Transacao?> GetByIdAsync(int id);  
        Task AddAsync(Transacao transacao);
        Task UpdateAsync(Transacao transacao);
        Task DeleteAsync(int id); 
        Task DeleteByPessoaIdAsync(int pessoaId);
    }
}