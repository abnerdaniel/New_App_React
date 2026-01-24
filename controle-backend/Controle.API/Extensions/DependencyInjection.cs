using Controle.Application.Interfaces;
using Controle.Application.Services;
using Controle.Domain.Interfaces;
using Controle.Infrastructure.Data;
using Controle.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Controle.API.Extensions 
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Banco de Dados
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            // Services
            services.AddScoped<IPessoaService, PessoaService>();
            services.AddScoped<ITransacaoService, TransacaoService>();
            services.AddScoped<ICategoriaService, CategoriaService>();
            services.AddScoped<IConsultaTotaisService, ConsultaTotaisService>();
            services.AddScoped<IAuthService, AuthService>();

            // Repositories
            services.AddScoped<IPessoaRepository, PessoaRepository>();
            services.AddScoped<ITransacaoRepository, TransacaoRepository>();
            services.AddScoped<ICategoriaRepository, CategoriaRepository>();
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();

            return services;
        }
    }
}


