using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Interfaces;

namespace Controle.Application.Services
{
    public class FuncionarioService : IFuncionarioService
    {
        private readonly IFuncionarioRepository _funcionarioRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly ICargoRepository _cargoRepository;
        private readonly IAuthService _authService;

        public FuncionarioService(
            IFuncionarioRepository funcionarioRepository,
            IUsuarioRepository usuarioRepository,
            ICargoRepository cargoRepository,
            IAuthService authService)
        {
            _funcionarioRepository = funcionarioRepository;
            _usuarioRepository = usuarioRepository;
            _cargoRepository = cargoRepository;
            _authService = authService;
        }

        public async Task<Result> CadastrarFuncionarioAsync(string nome, string email, string login, string password, string cargoNome, Guid lojaId)
        {
            // 1. Criar Usuário (AuthService já valida email/login duplicado)
            var registerResult = await _authService.RegisterAsync(nome, login, email, password, lojaId: null, createFuncionario: false);
            
            if (!registerResult.Success)
            {
                return Result.Fail(registerResult.Error ?? "Erro desconhecido ao registrar usuário.");
            }

            var usuarioResponse = registerResult.Data!;

            // 2. Ativar o usuário automaticamente (pois é um funcionário criado por um admin/sistema)
            var ativarResult = await _authService.AtivarUsuarioAsync(usuarioResponse.Id);
            if (!ativarResult.Success)
            {
                return Result.Fail("Erro ao ativar usuário do funcionário: " + ativarResult.Error);
            }

            // 3. Buscar Cargo
            var cargos = await _cargoRepository.GetAllAsync();
            var cargo = cargos.FirstOrDefault(c => c.Nome.Equals(cargoNome, StringComparison.OrdinalIgnoreCase));

            if (cargo == null)
            {
                // Se não achar, tenta criar ou retorna erro. Vamos retornar erro por segurança.
                // Opção: Criar cargo se não existir? O requisito diz "Cadastrar usuário para Garçom, Cozinheiro ou Motoboy".
                // Assumindo que os cargos já existem no banco.
                return Result.Fail($"Cargo '{cargoNome}' não encontrado.");
            }

            // 4. Criar Funcionario vinculado
            var funcionario = new Funcionario
            {
                Nome = nome,
                UsuarioId = usuarioResponse.Id,
                CargoId = cargo.Id,
                LojaId = lojaId,
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };

            await _funcionarioRepository.AddAsync(funcionario);

            return Result.Ok();
        }

        public async Task<IEnumerable<FuncionarioDTO>> ListarEquipeAsync(Guid lojaId)
        {
            var funcionarios = await _funcionarioRepository.GetAllAsync();
            
            // Filtrar por loja
            var equipeLoja = funcionarios.Where(f => f.LojaId == lojaId);

            var dtos = new List<FuncionarioDTO>();

            foreach (var func in equipeLoja)
            {
                var usuario = await _usuarioRepository.GetByIdAsync(func.UsuarioId);
                var cargo = await _cargoRepository.GetByIdAsync(func.CargoId);

                dtos.Add(new FuncionarioDTO
                {
                    Id = func.Id,
                    Nome = func.Nome,
                    Email = usuario?.Email ?? string.Empty,
                    Cargo = cargo?.Nome ?? "Desconhecido",
                    LojaId = func.LojaId,
                    Ativo = func.Ativo, // Status do funcionário na loja
                    DataCriacao = func.DataCriacao
                });
            }

            return dtos;
        }

        public async Task<Result> BloquearAcessoAsync(int funcionarioId)
        {
            var funcionario = await _funcionarioRepository.GetByIdAsync(funcionarioId);
            if (funcionario == null)
            {
                return Result.Fail("Funcionário não encontrado.");
            }

            // 1. Desativar Funcionario
            funcionario.Ativo = false;
            await _funcionarioRepository.UpdateAsync(funcionario);

            // 2. Bloquear Acesso do Usuário (Login)
            var desativarUsuarioResult = await _authService.DesativarUsuarioAsync(funcionario.UsuarioId);
            if (!desativarUsuarioResult.Success)
            {
                return Result.Fail("Funcionário desativado, mas erro ao bloquear usuário: " + desativarUsuarioResult.Error);
            }

            return Result.Ok();
        }
    }
}
