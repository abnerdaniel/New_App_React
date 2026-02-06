using System;

namespace Controle.Application.DTOs
{
    public class CreateCardapioDTO
    {
        public Guid LojaId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TimeSpan? HorarioInicio { get; set; }
        public TimeSpan? HorarioFim { get; set; }
        public string DiasSemana { get; set; } = string.Empty; // "0,1,2,3,4,5,6"
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public bool Ativo { get; set; }
    }
}
