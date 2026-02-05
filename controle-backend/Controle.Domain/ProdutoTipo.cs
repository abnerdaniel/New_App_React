using System.Collections.Generic;

namespace Controle.Domain
{
    public static class ProdutoTipo
    {
        public const string Pratos = "Pratos";
        public const string Lanches = "Lanches";
        public const string PorcoesPetiscos = "Porções/Petiscos";
        public const string Bebidas = "Bebidas";
        public const string Sobremesas = "Sobremesas";
        public const string Adicionais = "Adicionais";
        public const string Combos = "Combos";
        public const string Infantil = "Infantil";
        public const string Especiais = "Especiais";

        public static readonly HashSet<string> Todos = new HashSet<string>
        {
            Pratos, Lanches, PorcoesPetiscos, Bebidas, Sobremesas, Adicionais, Combos, Infantil, Especiais
        };

        public static bool EhValido(string tipo)
        {
            return Todos.Contains(tipo);
        }
    }
}
