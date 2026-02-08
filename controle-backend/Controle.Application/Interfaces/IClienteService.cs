using System.Collections.Generic;
using System.Threading.Tasks;
using Controle.Application.DTOs;
using Controle.Application.Services; // For Result class

namespace Controle.Application.Interfaces
{
    public interface IClienteService
    {
        Task<Result> AdicionarEnderecoAsync(int clienteId, EnderecoDTO enderecoDto);
        Task<IEnumerable<EnderecoDTO>> ListarEnderecosAsync(int clienteId);
        Task<IEnumerable<PedidoHistoricoDTO>> GetHistoricoPedidosAsync(int clienteId);
        Task<Result<ClienteLoginResponseDTO>> LoginAsync(ClienteLoginDTO dto);
        Task<Result<ClienteLoginResponseDTO>> RegisterAsync(ClienteRegisterDTO dto);
        Task<Result<ClienteLoginResponseDTO>> LoginWithGoogleAsync(string idToken);
        Task<Result> AtualizarEnderecoAsync(int clienteId, EnderecoDTO enderecoDto);
        Task<Result> RemoverEnderecoAsync(int clienteId, int enderecoId);
    }
}
