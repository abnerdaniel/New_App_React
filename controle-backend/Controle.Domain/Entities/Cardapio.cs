using System;
using System.Collections.Generic;

namespace Controle.Domain.Entities;

public class Cardapio
{
    public int Id { get; set; }
    public int LojaId { get; set; } // De qual loja é esse cardápio
    public string Nome { get; set; } = string.Empty; // Ex: "Principal", "Happy Hour", "Almoço"
    public bool Ativo { get; set; } = true;
    public bool Principal { get; set; } = false; // Define qual cardápio abre por padrão

    // Controle de Horários (Opcional, mas recomendado para SaaS)
    public TimeSpan? HorarioInicio { get; set; } // Ex: 11:00
    public TimeSpan? HorarioFim { get; set; }    // Ex: 15:00
    public string DiasSemana { get; set; } = "0,1,2,3,4,5,6"; // 0=Dom, 1=Seg... (Salva separado por vírgula)

    // Relacionamento (Um cardápio tem várias categorias/seções)
    public List<Categoria> Categorias { get; set; } = new(); 
}