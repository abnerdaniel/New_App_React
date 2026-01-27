using System;

namespace Controle.Application.DTOs
{
    public class CreateCardapioDTO
    {
        public int LojaId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TimeSpan? HorarioInicio { get; set; }
        public TimeSpan? HorarioFim { get; set; }
        public string DiasSemana { get; set; } = string.Empty; // "0,1,2,3,4,5,6"
        public bool Ativo { get; set; }
    }
}
