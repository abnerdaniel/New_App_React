using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Controle.Domain.Entities;

namespace Controle.Infrastructure.Configurations
{
    public class ClienteFinalConfiguration : IEntityTypeConfiguration<ClienteFinal>
    {
        public void Configure(EntityTypeBuilder<ClienteFinal> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Nome).IsRequired().HasMaxLength(200);
            builder.Property(c => c.PasswordHash).IsRequired().HasMaxLength(200);
            builder.Property(c => c.Email).IsRequired().HasMaxLength(100);
        }
    }
}
