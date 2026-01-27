namespace Controle.Domain.Entities;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty; // Ex: "Hambúrgueres", "Bebidas"
    public int CardapioId { get; set; } // <--- VÍNCULO NOVO
    public int OrdemExibicao { get; set; } = 0; // Para ordenar: 1º Lanches, 2º Bebidas...
}