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

namespace Controle.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUsuarioRepository usuarioRepository, IConfiguration configuration)
        {
            _usuarioRepository = usuarioRepository;
            _configuration = configuration;
        }

        public async Task<Result<AuthResponse>> LoginAsync(string login, string password)
        {
            var usuario = await _usuarioRepository.GetByLoginAsync(login);
            
            if (usuario == null)
            {
                return Result<AuthResponse>.Fail("Email ou senha inválidos.");
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

            var token = GenerateJwtToken(usuario);

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

        public async Task<Result<AuthResponse>> RegisterAsync(string nome, string login, string email, string password)
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

            // Cria o novo usuário (INATIVO até aprovação do admin)
            var usuario = new Usuario
            {
                Id = Controle.Domain.Utils.UuidV7.NewUuid(),
                Nome = nome,
                Login = login,
                Email = email,
                PasswordHash = HashPassword(password),
                Ativo = false, // Usuário criado como INATIVO
                DataCriacao = DateTime.UtcNow
            };

            await _usuarioRepository.AddAsync(usuario);

            // NÃO retorna token no registro, pois usuário precisa ser aprovado
            var response = new AuthResponse
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Login = usuario.Login,
                Email = usuario.Email,
                Token = string.Empty // Sem token até ser aprovado
            };

            return Result<AuthResponse>.Ok(response);
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

        private string GenerateJwtToken(Usuario usuario)
        {
            var secretKey = _configuration["Jwt:Key"] ?? "MinhaSuperChaveSecretaParaJWT1234567890";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nome)
            };

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
