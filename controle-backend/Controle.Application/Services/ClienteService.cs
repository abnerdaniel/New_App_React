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
using Google.Apis.Auth;

namespace Controle.Application.Services
{
    public class ClienteService : IClienteService
    {
        private readonly IEnderecoRepository _enderecoRepository;
        private readonly IPedidoRepository _pedidoRepository;
        private readonly IClienteFinalRepository _clienteFinalRepository;
        private readonly IConfiguration _configuration;

        public ClienteService(
            IEnderecoRepository enderecoRepository,
            IPedidoRepository pedidoRepository,
            IClienteFinalRepository clienteFinalRepository,
            IConfiguration configuration)
        {
            _enderecoRepository = enderecoRepository;
            _pedidoRepository = pedidoRepository;
            _clienteFinalRepository = clienteFinalRepository;
            _configuration = configuration;
        }

        public async Task<Result> AdicionarEnderecoAsync(int clienteId, EnderecoDTO enderecoDto)
        {
            var cliente = await _clienteFinalRepository.GetByIdAsync(clienteId);
            if (cliente == null)
            {
                return Result.Fail("Cliente não encontrado.");
            }

            var endereco = new Endereco
            {
                ClienteId = clienteId,
                Logradouro = enderecoDto.Logradouro,
                Bairro = enderecoDto.Bairro,
                Cidade = enderecoDto.Cidade,
                Estado = enderecoDto.Estado,
                CEP = enderecoDto.CEP,
                Complemento = enderecoDto.Complemento,
                Numero = enderecoDto.Numero,
                Referencia = enderecoDto.Referencia,
                Destinatario = enderecoDto.Destinatario,
                Apelido = enderecoDto.Apelido,
                LojaId = Guid.Empty // Endereço de cliente pode não estar vinculado a uma loja específica inicialmente
            };

            await _enderecoRepository.AddAsync(endereco);

            return Result.Ok();
        }

        public async Task<Result> AtualizarEnderecoAsync(int clienteId, EnderecoDTO enderecoDto)
        {
            var endereco = await _enderecoRepository.GetByIdAsync(enderecoDto.Id);
            if (endereco == null) return Result.Fail("Endereço não encontrado.");
            
            if (endereco.ClienteId != clienteId) return Result.Fail("Endereço não pertence ao cliente.");

            // Atualiza campos
            endereco.Logradouro = enderecoDto.Logradouro;
            endereco.Bairro = enderecoDto.Bairro;
            endereco.Cidade = enderecoDto.Cidade;
            endereco.Estado = enderecoDto.Estado;
            endereco.CEP = enderecoDto.CEP;
            endereco.Complemento = enderecoDto.Complemento;
            endereco.Numero = enderecoDto.Numero;
            endereco.Referencia = enderecoDto.Referencia;
            endereco.Destinatario = enderecoDto.Destinatario;
            endereco.Apelido = enderecoDto.Apelido;

            await _enderecoRepository.UpdateAsync(endereco);
            return Result.Ok();
        }

        public async Task<Result> RemoverEnderecoAsync(int clienteId, int enderecoId)
        {
            var endereco = await _enderecoRepository.GetByIdAsync(enderecoId);
            if (endereco == null) return Result.Fail("Endereço não encontrado.");

            if (endereco.ClienteId != clienteId) return Result.Fail("Endereço não pertence ao cliente.");

            await _enderecoRepository.DeleteAsync(endereco.Id);
            return Result.Ok();
        }

        public async Task<IEnumerable<EnderecoDTO>> ListarEnderecosAsync(int clienteId)
        {
            var enderecos = await _enderecoRepository.GetAllAsync();
            var enderecosCliente = enderecos.Where(e => e.ClienteId == clienteId);

            return enderecosCliente.Select(e => new EnderecoDTO
            {
                Id = e.Id,
                Logradouro = e.Logradouro,
                Bairro = e.Bairro,
                Cidade = e.Cidade,
                Estado = e.Estado,
                CEP = e.CEP ?? string.Empty,
                Complemento = e.Complemento ?? string.Empty,
                Numero = e.Numero ?? string.Empty,
                Referencia = e.Referencia ?? string.Empty,
                Destinatario = e.Destinatario ?? string.Empty,
                Apelido = e.Apelido ?? string.Empty
            });
        }

        public async Task<IEnumerable<PedidoHistoricoDTO>> GetHistoricoPedidosAsync(int clienteId)
        {
            var pedidos = await _pedidoRepository.GetAllAsync();
            var pedidosCliente = pedidos
                .Where(p => p.ClienteId == clienteId)
                .OrderByDescending(p => p.DataVenda);

            return pedidosCliente.Select(p => new PedidoHistoricoDTO
            {
                Id = p.Id,
                DataVenda = p.DataVenda,
                ValorTotal = p.ValorTotal ?? 0,
                Status = p.Status ?? "Indefinido",
                QuantidadeItens = p.Quantidade,
                ResumoItens = p.Descricao ?? string.Empty 
            });
        }

        public async Task<Result<ClienteLoginResponseDTO>> RegisterAsync(ClienteRegisterDTO dto)
        {
            var existingUser = await _clienteFinalRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return Result<ClienteLoginResponseDTO>.Fail("Email já cadastrado.");
            }

            var cliente = new ClienteFinal
            {
                Nome = dto.Nome,
                Email = dto.Email,
                Telefone = dto.Telefone,
                PasswordHash = HashPassword(dto.Password),
                Ativo = true
            };

            await _clienteFinalRepository.AddAsync(cliente);

            // Auto-login
            var token = GenerateJwtToken(cliente);

                return Result<ClienteLoginResponseDTO>.Ok(new ClienteLoginResponseDTO
            {
                Id = cliente.Id,
                Nome = cliente.Nome,
                Email = cliente.Email,
                Token = token,
                Telefone = cliente.Telefone ?? string.Empty
            });
        }

        public async Task<Result<ClienteLoginResponseDTO>> LoginAsync(ClienteLoginDTO dto)
        {
            var cliente = await _clienteFinalRepository.GetByEmailAsync(dto.Email);
            if (cliente == null || !VerifyPasswordHash(dto.Password, cliente.PasswordHash))
            {
                return Result<ClienteLoginResponseDTO>.Fail("Email ou senha inválidos.");
            }

            if (!cliente.Ativo)
            {
                return Result<ClienteLoginResponseDTO>.Fail("Conta inativa.");
            }

            var token = GenerateJwtToken(cliente);

            return Result<ClienteLoginResponseDTO>.Ok(new ClienteLoginResponseDTO
            {
                Id = cliente.Id,
                Nome = cliente.Nome,
                Email = cliente.Email,
                Token = token,
                Telefone = cliente.Telefone ?? string.Empty
            });
        }

        public async Task<Result<ClienteLoginResponseDTO>> LoginWithGoogleAsync(string idToken)
        {
            try
            {
                // Valida o token do Google
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { _configuration["Google:ClientId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                // Verifica se o cliente já existe pelo email
                var cliente = await _clienteFinalRepository.GetByEmailAsync(payload.Email);

                if (cliente == null)
                {
                    // Auto-registro: cria novo cliente
                    cliente = new ClienteFinal
                    {
                        Nome = payload.Name,
                        Email = payload.Email,
                        PasswordHash = HashPassword(Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "!G1"), // Senha aleatória
                        Ativo = true
                    };

                    await _clienteFinalRepository.AddAsync(cliente);
                }

                // Verifica se está ativo
                if (!cliente.Ativo)
                {
                    return Result<ClienteLoginResponseDTO>.Fail("Conta inativa.");
                }

                // Gera token JWT
                var token = GenerateJwtToken(cliente);

                return Result<ClienteLoginResponseDTO>.Ok(new ClienteLoginResponseDTO
                {
                    Id = cliente.Id,
                    Nome = cliente.Nome,
                    Email = cliente.Email,
                    Token = token,
                    Telefone = cliente.Telefone ?? string.Empty
                });
            }
            catch (InvalidJwtException ex)
            {
                return Result<ClienteLoginResponseDTO>.Fail($"Token do Google inválido: {ex.Message}");
            }
            catch (Exception ex)
            {
                return Result<ClienteLoginResponseDTO>.Fail($"Erro ao processar login com Google: {ex.Message}");
            }
        }

        public async Task<Result> UpdateProfileAsync(int clienteId, UpdateClienteProfileDTO dto)
        {
            var cliente = await _clienteFinalRepository.GetByIdAsync(clienteId);
            if (cliente == null) return Result.Fail("Cliente não encontrado.");

            cliente.Nome = dto.Nome;
            cliente.Telefone = dto.Telefone;

            await _clienteFinalRepository.UpdateAsync(cliente);
            return Result.Ok();
        }


        private string GenerateJwtToken(ClienteFinal cliente)
        {
            var secretKey = _configuration["Jwt:Key"] ?? "MinhaSuperChaveSecretaParaJWT1234567890";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, cliente.Id.ToString()),
                new Claim(ClaimTypes.Email, cliente.Email ?? ""),
                new Claim(ClaimTypes.Name, cliente.Nome),
                new Claim(ClaimTypes.Role, "ClienteFinal") // Role específica para clientes
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(30), // Sessão mais longa para clientes
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
