using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Controle.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Controle.Infrastructure.Configurations
{
    public class TransacaoConfiguration : IEntityTypeConfiguration<Transacao>
    {
        public void Configure(EntityTypeBuilder<Transacao> builder)
        {
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Descricao).IsRequired();
            builder.Property(t => t.Valor).IsRequired();
            builder.Property(t => t.Tipo).IsRequired();
            builder.Property(t => t.PessoaId).IsRequired();
            builder.Property(t => t.CategoriaId).IsRequired();
        }
    }

}