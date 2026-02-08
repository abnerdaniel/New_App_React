using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Domain.Entities;
public class Endereco
{
    public int Id { get; set; }
    public int ClienteId { get; set; }//Cliente Final
    public Guid LojaId { get; set; }//Loja
    public string Logradouro { get; set; } = string.Empty;//Logradouro
    public string Bairro { get; set; } = string.Empty;//Bairro
    public string Cidade { get; set; } = string.Empty;//Cidade
    public string Estado { get; set; } = string.Empty;//Estado
    public string? CEP { get; set; } = string.Empty;//CEP
    public string? Complemento { get; set; } = string.Empty;//Complemento
    public string? Numero { get; set; } = string.Empty;//Numero
    public string? Referencia { get; set; } = string.Empty;//Referencia
    public string? Destinatario { get; set; } = string.Empty;//Quem ira receber
    public string? Apelido { get; set; } = string.Empty; // Ex: Casa, Trabalho
}