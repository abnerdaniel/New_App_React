using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Controle.Domain.Entities;

namespace Controle.Infrastructure.Configurations
{
    public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
    {
        public void Configure(EntityTypeBuilder<Categoria> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Nome).IsRequired().HasMaxLength(100);
            builder.Property(c => c.OrdemExibicao).IsRequired().HasDefaultValue(0);

            // Relacionamento com Cardapio (Uma Categoria pertence a um Cardapio)
            // Já configurado em CardapioConfiguration, mas reforçando o lado da Categoria se necessário
            // builder.HasOne<Cardapio>().WithMany(c => c.Categorias).HasForeignKey(c => c.CardapioId);
        }
    }
}
