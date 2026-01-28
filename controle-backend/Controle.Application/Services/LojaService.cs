using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Domain.Interfaces;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Controle.Application.Services
{
    public class LojaService : ILojaService
    {
        private readonly AppDbContext _context;
        private readonly ICargoRepository _cargoRepository;
        private readonly IFuncionarioRepository _funcionarioRepository;
        private readonly IUsuarioRepository _usuarioRepository;

        public LojaService(
            AppDbContext context,
            ICargoRepository cargoRepository,
            IFuncionarioRepository funcionarioRepository,
            IUsuarioRepository usuarioRepository)
        {
            _context = context;
            _cargoRepository = cargoRepository;
            _funcionarioRepository = funcionarioRepository;
            _usuarioRepository = usuarioRepository;
        }

        public async Task<Loja> AtualizarConfiguracoesAsync(Guid lojaId, LojaConfiguracaoDTO dto)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            if (!string.IsNullOrEmpty(dto.Nome)) loja.Nome = dto.Nome;
            if (!string.IsNullOrEmpty(dto.LogoUrl)) loja.LogoUrl = dto.LogoUrl;
            if (dto.TempoMinimoEntrega.HasValue) loja.TempoMinimoEntrega = dto.TempoMinimoEntrega;
            if (dto.TempoMaximoEntrega.HasValue) loja.TempoMaximoEntrega = dto.TempoMaximoEntrega;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }

        public async Task<Loja> GerirTaxasEntregaAsync(Guid lojaId, TaxaEntregaDTO dto)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            if (dto.TaxaEntregaFixa.HasValue) loja.TaxaEntregaFixa = dto.TaxaEntregaFixa;
            if (dto.TaxaPorKm.HasValue) loja.TaxaPorKm = dto.TaxaPorKm;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }

        public async Task<Loja> AbrirFecharLojaAsync(Guid lojaId, bool? aberta)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            loja.AbertaManualmente = aberta;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }
        public async Task<Loja> CriarLojaAsync(CreateLojaDTO dto)
        {
            var loja = new Loja
            {
                Id = Controle.Domain.Utils.UuidV7.NewUuid(),
                Nome = dto.Nome,
                CpfCnpj = dto.CpfCnpj,
                Telefone = dto.Telefone,
                Email = dto.Email,
                Senha = dto.Senha, // Nota: Em produção, deve-se hashear a senha
                Instagram = dto.Instagram,
                Facebook = dto.Facebook,
                Twitter = dto.Twitter,
                LinkedIn = dto.LinkedIn,
                WhatsApp = dto.WhatsApp,
                Telegram = dto.Telegram,
                YouTube = dto.YouTube,
                Twitch = dto.Twitch,
                TikTok = dto.TikTok,
                UsuarioId = dto.UsuarioId,
                Ativo = dto.Ativo,
                DataCriacao = System.DateTime.UtcNow
            };

            _context.Lojas.Add(loja);
            await _context.SaveChangesAsync();

            return loja;
        }

        public async Task<Loja> AtualizarLojaAsync(Guid lojaId, UpdateLojaDTO dto)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            if (!string.IsNullOrEmpty(dto.Nome)) loja.Nome = dto.Nome;
            if (!string.IsNullOrEmpty(dto.CpfCnpj)) loja.CpfCnpj = dto.CpfCnpj;
            if (!string.IsNullOrEmpty(dto.Telefone)) loja.Telefone = dto.Telefone;
            if (!string.IsNullOrEmpty(dto.Email)) loja.Email = dto.Email;
            if (!string.IsNullOrEmpty(dto.Instagram)) loja.Instagram = dto.Instagram;
            if (!string.IsNullOrEmpty(dto.Facebook)) loja.Facebook = dto.Facebook;
            if (!string.IsNullOrEmpty(dto.Twitter)) loja.Twitter = dto.Twitter;
            if (!string.IsNullOrEmpty(dto.LinkedIn)) loja.LinkedIn = dto.LinkedIn;
            if (!string.IsNullOrEmpty(dto.WhatsApp)) loja.WhatsApp = dto.WhatsApp;
            if (!string.IsNullOrEmpty(dto.Telegram)) loja.Telegram = dto.Telegram;
            if (!string.IsNullOrEmpty(dto.YouTube)) loja.YouTube = dto.YouTube;
            if (!string.IsNullOrEmpty(dto.Twitch)) loja.Twitch = dto.Twitch;
            if (!string.IsNullOrEmpty(dto.TikTok)) loja.TikTok = dto.TikTok;
            if (dto.Ativo.HasValue) loja.Ativo = dto.Ativo.Value;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }
    }
}
