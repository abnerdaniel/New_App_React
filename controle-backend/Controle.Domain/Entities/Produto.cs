using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public string Marca { get; set; }
    public string Modelo { get; set; }
    public string Cor { get; set; }
    public string Tamanho { get; set; }
    public string Tipo { get; set; }
    public string Material { get; set; }
    public string Fabricante { get; set; }
    public string URL_Imagem { get; set; }
    public string URL_Video { get; set; }
    public string URL_Audio { get; set; }
    public string URL_Documento { get; set; }
    public Guid LojaId { get; set; }
}
   