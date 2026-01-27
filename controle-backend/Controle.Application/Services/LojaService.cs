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

            // --- Lógica para atribuir cargo de Proprietário ao criador ---
            const string cargoProprietario = "Proprietário / Sócio";
            var cargos = await _cargoRepository.GetAllAsync();
            var cargo = cargos.FirstOrDefault(c => c.Nome.Equals(cargoProprietario, System.StringComparison.OrdinalIgnoreCase));

            if (cargo == null)
            {
                cargo = new Cargo { Nome = cargoProprietario };
                await _cargoRepository.AddAsync(cargo);
                // O ID é gerado pelo banco, precisamos recarregar ou confiar que o EF preencheu se for Identity
                // Mas como AddAsync do repositório pode não salvar imediatamente se não tiver SaveChanges, 
                // vamos garantir que o cargo tenha ID. O repositório AddAsync chama SaveChanges na implementação atual.
            }

            // Buscar nome do usuário para o funcionário
            var usuario = await _usuarioRepository.GetByIdAsync(dto.UsuarioId);
            var nomeFuncionario = usuario?.Nome ?? "Proprietário";

            var funcionario = new Funcionario
            {
                Nome = nomeFuncionario,
                UsuarioId = dto.UsuarioId,
                LojaId = loja.Id,
                CargoId = cargo.Id,
                Ativo = true,
                DataCriacao = System.DateTime.UtcNow
            };

            await _funcionarioRepository.AddAsync(funcionario);
            // -------------------------------------------------------------

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
