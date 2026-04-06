using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Exceptions;
using Controle.Domain.Interfaces;
using Controle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

using System.Text;
using System.Text.RegularExpressions;

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

            if (!string.IsNullOrEmpty(dto.Nome)) 
            {
                loja.Nome = dto.Nome;
                loja.Slug = await GenerateUniqueSlugAsync(dto.Nome, loja.Id);
            }
            if (!string.IsNullOrEmpty(dto.LogoUrl)) loja.LogoUrl = dto.LogoUrl;
            if (dto.TempoMinimoEntrega.HasValue) loja.TempoMinimoEntrega = dto.TempoMinimoEntrega;
            if (dto.TempoMaximoEntrega.HasValue) loja.TempoMaximoEntrega = dto.TempoMaximoEntrega;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }

        public async Task<Loja> AtualizarAtendimentoIAConfiguracoesAsync(Guid lojaId, AtendimentoIAConfigsDTO dto)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            loja.IaEnabled = dto.IaEnabled;
            loja.SendCustomerNumber = dto.SendCustomerNumber;
            loja.SendOrderSummary = dto.SendOrderSummary;
            loja.OrderUpdates = dto.OrderUpdates;
            loja.BotWithoutIA = dto.BotWithoutIA;
            loja.OrderSummaryTemplate = dto.OrderSummaryTemplate;
            loja.ShowAddressOnSummary = dto.ShowAddressOnSummary;
            loja.ShowPaymentOnSummary = dto.ShowPaymentOnSummary;

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
            var newId = Controle.Domain.Utils.UuidV7.NewUuid();
            var loja = new Loja
            {
                Id = newId,
                Nome = dto.Nome,
                Slug = await GenerateUniqueSlugAsync(dto.Nome, newId),
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
                // Endereço
                Cep = dto.Cep,
                Logradouro = dto.Logradouro,
                Numero = dto.Numero,
                Complemento = dto.Complemento,
                Bairro = dto.Bairro,
                Cidade = dto.Cidade,

                Estado = dto.Estado,
                
                // Imagens
                LogoUrl = dto.LogoUrl,
                CapaUrl = dto.CapaUrl,
                
                UsuarioId = dto.UsuarioId,
                Ativo = dto.Ativo,
                AceiteAutomatico = dto.AceiteAutomatico,
                DespachoAutomatico = dto.DespachoAutomatico,
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

            if (!string.IsNullOrEmpty(dto.Nome)) 
            {
                loja.Nome = dto.Nome;
                loja.Slug = await GenerateUniqueSlugAsync(dto.Nome, loja.Id);
            }
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
            
            // Endereço
            if (!string.IsNullOrEmpty(dto.Cep)) loja.Cep = dto.Cep;
            if (!string.IsNullOrEmpty(dto.Logradouro)) loja.Logradouro = dto.Logradouro;
            if (!string.IsNullOrEmpty(dto.Numero)) loja.Numero = dto.Numero;
            if (!string.IsNullOrEmpty(dto.Complemento)) loja.Complemento = dto.Complemento;
            if (!string.IsNullOrEmpty(dto.Bairro)) loja.Bairro = dto.Bairro;
            if (!string.IsNullOrEmpty(dto.Cidade)) loja.Cidade = dto.Cidade;
            if (!string.IsNullOrEmpty(dto.Estado)) loja.Estado = dto.Estado;

            // Imagens
            if (!string.IsNullOrEmpty(dto.LogoUrl)) loja.LogoUrl = dto.LogoUrl;
            if (!string.IsNullOrEmpty(dto.CapaUrl)) loja.CapaUrl = dto.CapaUrl;

            if (dto.Ativo.HasValue) loja.Ativo = dto.Ativo.Value;

            // Configurações
            if (!string.IsNullOrEmpty(dto.Categoria)) loja.Categoria = dto.Categoria;
            if (dto.Avaliacao.HasValue) loja.Avaliacao = dto.Avaliacao.Value;
            if (dto.TempoMinimoEntrega.HasValue) loja.TempoMinimoEntrega = dto.TempoMinimoEntrega.Value;
            if (dto.TempoMaximoEntrega.HasValue) loja.TempoMaximoEntrega = dto.TempoMaximoEntrega.Value;
            if (dto.TaxaEntregaFixa.HasValue) loja.TaxaEntregaFixa = dto.TaxaEntregaFixa.Value;

            if (dto.AceiteAutomatico.HasValue) loja.AceiteAutomatico = dto.AceiteAutomatico.Value;
            if (dto.DespachoAutomatico.HasValue) loja.DespachoAutomatico = dto.DespachoAutomatico.Value;

            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();

            return loja;
        }

        public async Task<Loja?> GetLojaByIdAsync(Guid lojaId)
        {
            return await _context.Lojas.FindAsync(lojaId);
        }

        public async Task<Loja?> GetLojaByIdentifierAsync(string identifier)
        {
            if (Guid.TryParse(identifier, out var lojaId))
            {
                return await _context.Lojas.FindAsync(lojaId);
            }

            // Busca por Slug ou Nome (insensível a maiúsculas)
            var loja = await _context.Lojas
                .FirstOrDefaultAsync(l => l.Slug.ToLower() == identifier.ToLower() || l.Nome.ToLower() == identifier.Replace("-", " ").ToLower());

            // Se achou pelo nome mas sem slug, vamos gerar o slug para o futuro (Auto-Fix)
            if (loja != null && string.IsNullOrEmpty(loja.Slug))
            {
               loja.Slug = identifier.ToLower().Replace(" ", "-");
               _context.Lojas.Update(loja);
               await _context.SaveChangesAsync();
            }

            return loja;
        }

        public async Task<IEnumerable<Loja>> GetLojasByUsuarioIdAsync(Guid usuarioId)
        {
            return await _context.Lojas
                .Where(l => l.UsuarioId == usuarioId)
                .ToListAsync();
        }

        public async Task AtualizarLojaDirectAsync(Loja loja)
        {
            _context.Lojas.Update(loja);
            await _context.SaveChangesAsync();
        }

        public async Task ExcluirLojaAsync(Guid lojaId)
        {
            var loja = await _context.Lojas.FindAsync(lojaId);
            if (loja == null) throw new DomainException("Loja não encontrada.");

            _context.Lojas.Remove(loja);
            await _context.SaveChangesAsync();
        }

        private string GenerateSlug(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;

            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            var slug = stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
            
            // Substituir espaços e caracteres indesejados por hífens
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            // Substituir múltiplos espaços ou hífens por um único hífen
            slug = Regex.Replace(slug, @"[\s-]+", "-");
            // Remover hífens do início e do final
            slug = slug.Trim('-');

            return slug;
        }

        private async Task<string> GenerateUniqueSlugAsync(string text, Guid? currentLojaId = null)
        {
            var slug = GenerateSlug(text);
            if (string.IsNullOrEmpty(slug)) return string.Empty;

            var slugExists = await _context.Lojas.AnyAsync(l => l.Slug == slug && (!currentLojaId.HasValue || l.Id != currentLojaId.Value));

            if (slugExists)
            {
                throw new DomainException($"O nome da loja '{text}' já está em uso por outro estabelecimento. Por favor, escolha outro nome ou adicione o nome do seu bairro/cidade ao final (ex: '{text} Centro') para criar um link único e exclusivo.");
            }

            return slug;
        }
    }
}
