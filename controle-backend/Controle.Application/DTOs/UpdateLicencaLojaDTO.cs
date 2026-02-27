using System;

namespace Controle.Application.DTOs
{
    public class UpdateLicencaLojaDTO
    {
        public DateTime? LicencaValidaAte { get; set; }
        public bool BloqueadaPorFaltaDePagamento { get; set; }
        public string? UrlComprovantePagamento { get; set; }
    }
}
