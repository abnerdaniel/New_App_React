using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Interfaces;
using Controle.Domain.Entities;
using Controle.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth; // Biblioteca oficial do Google para validar Tokens

namespace Controle.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly ILojaRepository _lojaRepository;
        private readonly IFuncionarioRepository _funcionarioRepository;
        private readonly ICargoRepository _cargoRepository;
        private readonly IConfiguration _configuration;

        public AuthService(
            IUsuarioRepository usuarioRepository,
            ILojaRepository lojaRepository,
            IFuncionarioRepository funcionarioRepository,
            ICargoRepository cargoRepository,
            IConfiguration configuration)
        {
            _usuarioRepository = usuarioRepository;
            _lojaRepository = lojaRepository;
            _funcionarioRepository = funcionarioRepository;
            _cargoRepository = cargoRepository;
            _configuration = configuration;
        }

        public async Task<Result<AuthResponse>> LoginAsync(string login, string password)
        {
            var usuario = await _usuarioRepository.GetByLoginAsync(login);
            
            if (usuario == null)
            {
                return Result<AuthResponse>.Fail("Login ou senha inválidos.");
            }

            if (!VerifyPasswordHash(password, usuario.PasswordHash))
            {
                return Result<AuthResponse>.Fail("Login ou senha inválidos.");
            }

            // Verifica se o usuário está ativo (aprovado pelo admin)
            if (!usuario.Ativo)
            {
                return Result<AuthResponse>.Fail("Usuário aguardando aprovação do administrador.");
            }

            // Atualiza último acesso
            usuario.UltimoAcesso = DateTime.UtcNow;
            await _usuarioRepository.UpdateAsync(usuario);

            // Buscar Funcionários vinculados (Equipe) - FETCH BEFORE TOKEN
            var funcionarios = await _funcionarioRepository.GetByUsuarioIdAsync(usuario.Id);
            var funcionariosDto = new List<FuncionarioResumoDTO>();
            int? primaryFuncionarioId = null;

            foreach (var f in funcionarios)
            {
                var cargo = await _cargoRepository.GetByIdAsync(f.CargoId);
                funcionariosDto.Add(new FuncionarioResumoDTO
                {
                    Id = f.Id,
                    LojaId = f.LojaId,
                    Cargo = cargo?.Nome ?? "Desconhecido",
                    Ativo = f.Ativo,
                    AcessoSistemaCompleto = f.AcessoSistemaCompleto,
                    Telefone = f.Telefone
                });
                
                // Picking the first active one as primary for the token
                if (primaryFuncionarioId == null && f.Ativo) 
                    primaryFuncionarioId = f.Id;
            }

            var token = GenerateJwtToken(usuario, primaryFuncionarioId);

            // Buscar Lojas vinculadas (Dono)
            var lojas = await _lojaRepository.GetByUsuarioIdAsync(usuario.Id);
            var lojasDto = lojas.Select(l => new LojaResumoDTO
            {
                Id = l.Id,
                Nome = l.Nome,
                ImagemUrl = l.LogoUrl
            }).ToList();

            var response = new AuthResponse
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Login = usuario.Login,
                Email = usuario.Email,
                Token = token,
                Lojas = lojasDto,
                Funcionarios = funcionariosDto
            };

            return Result<AuthResponse>.Ok(response);
        }

        public async Task<Result<AuthResponse>> RegisterAsync(string nome, string login, string email, string password, Guid? lojaId = null, bool createFuncionario = true)
        {
            // Verifica se o login já existe
            var existingUserLogin = await _usuarioRepository.GetByLoginAsync(login);
            if (existingUserLogin != null)
            {
                return Result<AuthResponse>.Fail("Login já está em uso.");
            }

            // Verifica se o email já existe
            var existingUser = await _usuarioRepository.GetByEmailAsync(email);
            if (existingUser != null)
            {
                return Result<AuthResponse>.Fail("Email já está em uso.");
            }

            // Cria o novo usuário (INATIVO até aprovação do admin, exceto se criar loja)
            var usuario = new Usuario
            {
                Id = Controle.Domain.Utils.UuidV7.NewUuid(),
                Nome = nome,
                Login = login,
                Email = email,
                PasswordHash = HashPassword(password),
                Ativo = lojaId.HasValue, // Se criar loja, o usuário já nasce ativo (dono)
                DataCriacao = DateTime.UtcNow
            };

            await _usuarioRepository.AddAsync(usuario);

            if (createFuncionario)
            {
                // Criar Cargo Proprietário se não existir
                const string cargoProprietario = "Proprietário / Sócio";
                var cargos = await _cargoRepository.GetAllAsync();
                var cargo = cargos.FirstOrDefault(c => c.Nome.Equals(cargoProprietario, StringComparison.OrdinalIgnoreCase));

                if (cargo == null)
                {
                    cargo = new Cargo { Nome = cargoProprietario };
                    await _cargoRepository.AddAsync(cargo);
                }

                if (!lojaId.HasValue)
                {
                    lojaId = Controle.Domain.Utils.UuidV7.NewUuid();
                }

                // Criar Funcionario (Dono)
                var funcionario = new Funcionario
                {
                    Nome = nome,
                    UsuarioId = usuario.Id,
                    LojaId = lojaId,
                    CargoId = cargo.Id,
                    Ativo = true,
                    DataCriacao = DateTime.UtcNow
                };

                await _funcionarioRepository.AddAsync(funcionario);

                // Criar Loja (Sempre criar se createFuncionario for true - fluxo de registro de dono)
                var loja = new Loja
                {
                    Id = lojaId.Value,
                        Nome = $"Nova Loja",
                        UsuarioId = usuario.Id,
                        Ativo = true,
                        DataCriacao = DateTime.UtcNow,
                        // Campos obrigatórios mínimos
                        CpfCnpj = "00000000000",
                        Telefone = "0000000000",
                        Email = email,
                        Senha = "temp", // Não usado para login, mas obrigatório na entidade
                        Instagram = "", Facebook = "", Twitter = "", LinkedIn = "", WhatsApp = "", Telegram = "", YouTube = "", Twitch = "", TikTok = ""
                    };
                    
                    await _lojaRepository.AddAsync(loja);
            }

            // Não retornar token no registro por segurança
            var token = string.Empty;

            var response = new AuthResponse
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Login = usuario.Login,
                Email = usuario.Email,
                Token = token
            };

            return Result<AuthResponse>.Ok(response);
        }

        public async Task<Result<AuthResponse>> LoginWithGoogleAsync(string idToken)
        {
            try
            {
                // Define as configurações de validação
                // É IMPORTANTE checar se o Client ID bate com o da nossa aplicação
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { _configuration["Google:ClientId"] } // Busca o Client ID do appsettings
                };

                // Valida o token diretamente nos servidores do Google
                // Se for inválido, expirado ou forjado, este método lança uma exceção
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                // Token válido! Agora verificamos se o usuário já existe no nosso banco pelo e-mail
                var usuario = await _usuarioRepository.GetByEmailAsync(payload.Email);

                if (usuario == null)
                {
                    // === USUÁRIO NOVO: REGISTRAR ===
                    // Se o e-mail não existe, criamos um novo registro automaticamente
                    
                    // Usamos o e-mail como login também para simplificar
                    var novoLogin = payload.Email; 

                    // Verifica se por acaso esse login já existe (raro, mas possível de conflitar)
                    var existingLogin = await _usuarioRepository.GetByLoginAsync(novoLogin);
                    if (existingLogin != null)
                    {
                        // Se conflitar, adiciona um sufixo aleatório
                        novoLogin = $"{payload.Email}_{new Random().Next(1000, 9999)}";
                    }

                    // Registra usando nossa lógica existente, mas gerando uma senha aleatória forte
                    // já que o usuário vai logar sempre pelo Google
                    var senhaAleatoria = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "!A1";
                    
                    // Chamamos o método Register existente
                    // Nota: createFuncionario = true para criar a Loja e o Funkcionário (Dono) automaticamente.
                    // Isso gera uma "Nova Loja" que será detectada pelo frontend para completar o setup.
                    var lojaId = Controle.Domain.Utils.UuidV7.NewUuid();
                    var registerResult = await RegisterAsync(payload.Name, novoLogin, payload.Email, senhaAleatoria, lojaId, createFuncionario: true);
                    
                    if (!registerResult.Success)
                    {
                        return Result<AuthResponse>.Fail($"Erro ao registrar usuário Google: {registerResult.Error}");
                    }
                    
                    // Recupera o usuário recém-criado para gerar o token
                    usuario = await _usuarioRepository.GetByEmailAsync(payload.Email);
                }

                // === USUÁRIO EXISTENTE ou RECÉM-CRIADO: LOGAR ===
                
                // Verifica status
                if (!usuario.Ativo)
                {
                    return Result<AuthResponse>.Fail("Usuário aguardando aprovação do administrador.");
                }

                // Atualiza último acesso
                usuario.UltimoAcesso = DateTime.UtcNow;
                await _usuarioRepository.UpdateAsync(usuario);

                // Buscar Funcionários vinculados (Equipe) - FETCH BEFORE TOKEN
                var funcionarios = await _funcionarioRepository.GetByUsuarioIdAsync(usuario.Id);
                var funcionariosDto = new List<FuncionarioResumoDTO>();
                int? primaryFuncionarioId = null;

                foreach (var f in funcionarios)
                {
                    var cargo = await _cargoRepository.GetByIdAsync(f.CargoId);
                    funcionariosDto.Add(new FuncionarioResumoDTO
                    {
                        Id = f.Id,
                        LojaId = f.LojaId,
                        Cargo = cargo?.Nome ?? "Desconhecido",
                        Ativo = f.Ativo,
                        AcessoSistemaCompleto = f.AcessoSistemaCompleto,
                        Telefone = f.Telefone
                    });
                     if (primaryFuncionarioId == null && f.Ativo) 
                        primaryFuncionarioId = f.Id;
                }

                // Gera nosso JWT interno
                var appToken = GenerateJwtToken(usuario, primaryFuncionarioId);

                // Buscar Lojas e Funcionários para retornar no DTO (igual ao Login padrão)
                var lojas = await _lojaRepository.GetByUsuarioIdAsync(usuario.Id);
                var lojasDto = lojas.Select(l => new LojaResumoDTO
                {
                    Id = l.Id,
                    Nome = l.Nome,
                    ImagemUrl = l.LogoUrl
                }).ToList();

                var response = new AuthResponse
                {
                    Id = usuario.Id,
                    Nome = usuario.Nome,
                    Login = usuario.Login,
                    Email = usuario.Email,
                    Token = appToken,
                    Lojas = lojasDto,
                    Funcionarios = funcionariosDto
                };

                return Result<AuthResponse>.Ok(response);

            }
            catch (InvalidJwtException ex)
            {
                // Token inválido (formato errado, expirado, assinatura inválida)
                return Result<AuthResponse>.Fail($"Token do Google inválido: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Erro genérico
                return Result<AuthResponse>.Fail($"Erro ao processar login com Google: {ex.Message}");
            }
        }



        public async Task<UsuarioResponse?> GetUsuarioByIdAsync(Guid id)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(id);
            
            if (usuario == null)
                return null;

            return new UsuarioResponse
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Login = usuario.Login,
                Email = usuario.Email,
                Ativo = usuario.Ativo,
                DataCriacao = usuario.DataCriacao,
                UltimoAcesso = usuario.UltimoAcesso
            };
        }

        public async Task<IEnumerable<UsuarioResponse>> GetAllUsuariosAsync()
        {
            var usuarios = await _usuarioRepository.GetAllAsync();
            
            return usuarios.Select(u => new UsuarioResponse
            {
                Id = u.Id,
                Nome = u.Nome,
                Login = u.Login,
                Email = u.Email,
                Ativo = u.Ativo,
                DataCriacao = u.DataCriacao,
                UltimoAcesso = u.UltimoAcesso
            });
        }

        public async Task<Result> AtivarUsuarioAsync(Guid usuarioId)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
            
            if (usuario == null)
            {
                return Result.Fail("Usuário não encontrado.");
            }

            if (usuario.Ativo)
            {
                return Result.Fail("Usuário já está ativo.");
            }

            usuario.Ativo = true;
            await _usuarioRepository.UpdateAsync(usuario);

            return Result.Ok();
        }

        public async Task<Result> DesativarUsuarioAsync(Guid usuarioId)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
            
            if (usuario == null)
            {
                return Result.Fail("Usuário não encontrado.");
            }

            if (!usuario.Ativo)
            {
                return Result.Fail("Usuário já está inativo.");
            }

            usuario.Ativo = false;
            await _usuarioRepository.UpdateAsync(usuario);

            return Result.Ok();
        }

        public async Task<Result> DeletarUsuarioAsync(Guid usuarioId)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
            if (usuario == null) return Result.Fail("Usuário não encontrado.");

            await _usuarioRepository.DeleteAsync(usuarioId);
            // If repository only takes int, we have a problem. Usuario Id is Guid.
            // Let's check IUsuarioRepository. Usually it's DeleteAsync(Guid id).
            return Result.Ok();
        }

        public async Task<Result> AlterarSenhaUsuarioAsync(Guid usuarioId, string novaSenha)
        {
             var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
             if (usuario == null) return Result.Fail("Usuário não encontrado.");

             usuario.PasswordHash = HashPassword(novaSenha);
             await _usuarioRepository.UpdateAsync(usuario);
             
             return Result.Ok();
        }

        private string GenerateJwtToken(Usuario usuario, int? funcionarioId = null)
        {
            var secretKey = _configuration["Jwt:Key"] ?? "MinhaSuperChaveSecretaParaJWT1234567890";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nome)
            };

            if (funcionarioId.HasValue)
            {
                claims.Add(new Claim("FuncionarioId", funcionarioId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPasswordHash(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == hash;
        }
    }
}
