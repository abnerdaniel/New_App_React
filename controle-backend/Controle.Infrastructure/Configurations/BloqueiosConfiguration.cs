using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Controle.Domain.Entities;

namespace Controle.Infrastructure.Configurations
{
    public class BloqueiosConfiguration : IEntityTypeConfiguration<Bloqueios>
    {
        public void Configure(EntityTypeBuilder<Bloqueios> builder)
        {
            builder.HasKey(b => b.Id);
            builder.Property(b => b.Motivo).IsRequired().HasMaxLength(200);
            builder.Property(b => b.Tipo).IsRequired().HasMaxLength(50);
            builder.Property(b => b.Status)
                .HasConversion<string>() // Store Enum as String
                .IsRequired();
        }
    }
}
