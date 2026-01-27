using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Controle.Domain.Entities;

namespace Controle.Infrastructure.Configurations
{
    public class CardapioConfiguration : IEntityTypeConfiguration<Cardapio>
    {
        public void Configure(EntityTypeBuilder<Cardapio> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Nome).IsRequired().HasMaxLength(100);
            builder.Property(c => c.Ativo).IsRequired().HasDefaultValue(true);
            builder.Property(c => c.Principal).IsRequired().HasDefaultValue(false);
            builder.Property(c => c.DiasSemana).HasMaxLength(50);

            // Relacionamento com Categoria (Um Cardapio tem muitas Categorias)
            builder.HasMany(c => c.Categorias)
                   .WithOne()
                   .HasForeignKey(cat => cat.CardapioId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
