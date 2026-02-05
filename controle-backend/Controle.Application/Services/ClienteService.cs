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
    public class ClienteService : IClienteService
    {
        private readonly IEnderecoRepository _enderecoRepository;
        private readonly IPedidoRepository _pedidoRepository;
        private readonly IClienteFinalRepository _clienteFinalRepository;

        public ClienteService(
            IEnderecoRepository enderecoRepository,
            IPedidoRepository pedidoRepository,
            IClienteFinalRepository clienteFinalRepository)
        {
            _enderecoRepository = enderecoRepository;
            _pedidoRepository = pedidoRepository;
            _clienteFinalRepository = clienteFinalRepository;
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
                LojaId = Guid.Empty // Endereço de cliente pode não estar vinculado a uma loja específica inicialmente
            };

            await _enderecoRepository.AddAsync(endereco);

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
                Referencia = e.Referencia ?? string.Empty
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
                ResumoItens = p.Descricao ?? string.Empty // Assumindo que Descricao contém um resumo ou concatenar itens se necessário
            });
        }
    }
}
