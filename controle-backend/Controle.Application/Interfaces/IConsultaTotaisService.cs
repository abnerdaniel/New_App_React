using Controle.Application.DTOs;

namespace Controle.Application.Interfaces
{
    public interface IConsultaTotaisService
    {
        Task<ListaPessoasResponse?> ConsultaTotalPorPessoa();
    }
}
