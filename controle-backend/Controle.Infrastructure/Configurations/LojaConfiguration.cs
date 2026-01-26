using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Controle.Domain.Entities;

namespace Controle.Infrastructure.Configurations
{
    public class LojaConfiguration : IEntityTypeConfiguration<Loja>
    {
        public void Configure(EntityTypeBuilder<Loja> builder)
        {
            builder.HasKey(l => l.Id);
            builder.Property(l => l.Nome).IsRequired().HasMaxLength(100);
            builder.Property(l => l.CpfCnpj).IsRequired().HasMaxLength(20);
            builder.Property(l => l.Email).IsRequired().HasMaxLength(100);
            builder.Property(l => l.Ativo).IsRequired();
        }
    }
}
