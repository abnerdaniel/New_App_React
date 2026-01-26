using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Controle.Domain.Entities;

namespace Controle.Infrastructure.Configurations
{
    public class ProdutoLojaConfiguration : IEntityTypeConfiguration<ProdutoLoja>
    {
        public void Configure(EntityTypeBuilder<ProdutoLoja> builder)
        {
            builder.HasKey(pl => pl.Id);
            builder.Property(pl => pl.QuantidadeEstoque).IsRequired();
        }
    }
}
