using Controle.Infrastructure.Data;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Controle.Infrastructure.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            // 1. Identifica onde o comando está sendo executado
            string basePath = Directory.GetCurrentDirectory();

            // 2. Tenta localizar a pasta da API para achar o appsettings.json
            if (!File.Exists(Path.Combine(basePath, "appsettings.json")))
            {
                if (Directory.Exists(Path.Combine(basePath, "Controle.API")))
                {
                    basePath = Path.Combine(basePath, "Controle.API");
                }
                else if (Directory.Exists(Path.Combine(basePath, "..", "Controle.API")))
                {
                    basePath = Path.Combine(basePath, "..", "Controle.API");
                }
            }

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new System.Exception("A string de conexão 'DefaultConnection' não foi encontrada no appsettings.json.");
            }

            optionsBuilder.UseNpgsql(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}