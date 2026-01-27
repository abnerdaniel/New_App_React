using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Controle.Application.Services
{
    public class LojaService : ILojaService
    {
        private readonly AppDbContext _context;

        public LojaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Loja> AtualizarConfiguracoesAsync(Guid lojaId, LojaConfiguracaoDTO dto)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            loja.Nome = dto.Nome;
            loja.LogoUrl = dto.LogoUrl;
            loja.TempoMinimoEntrega = dto.TempoMinimoEntrega;
            loja.TempoMaximoEntrega = dto.TempoMaximoEntrega;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }

        public async Task<Loja> GerirTaxasEntregaAsync(Guid lojaId, TaxaEntregaDTO dto)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            loja.TaxaEntregaFixa = dto.TaxaEntregaFixa;
            loja.TaxaPorKm = dto.TaxaPorKm;

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

            loja.Nome = dto.Nome;
            loja.CpfCnpj = dto.CpfCnpj;
            loja.Telefone = dto.Telefone;
            loja.Email = dto.Email;
            loja.Instagram = dto.Instagram;
            loja.Facebook = dto.Facebook;
            loja.Twitter = dto.Twitter;
            loja.LinkedIn = dto.LinkedIn;
            loja.WhatsApp = dto.WhatsApp;
            loja.Telegram = dto.Telegram;
            loja.YouTube = dto.YouTube;
            loja.Twitch = dto.Twitch;
            loja.TikTok = dto.TikTok;
            loja.Ativo = dto.Ativo;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }
    }
}
