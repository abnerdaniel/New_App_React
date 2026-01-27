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
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICardapioService, CardapioService>();
            services.AddScoped<ICatalogoService, CatalogoService>();
            services.AddScoped<IVitrineService, VitrineService>();
            services.AddScoped<IPedidoService, PedidoService>();

            // Repositories
            // Repositories
            services.AddScoped<IBloqueiosRepository, BloqueiosRepository>();
            services.AddScoped<ICargoRepository, CargoRepository>();
            services.AddScoped<IClienteFinalRepository, ClienteFinalRepository>();
            services.AddScoped<IEnderecoRepository, EnderecoRepository>();
            services.AddScoped<IFuncionarioRepository, FuncionarioRepository>();
            services.AddScoped<ILojaRepository, LojaRepository>();
            services.AddScoped<IPedidoRepository, PedidoRepository>();
            services.AddScoped<IPedidoItemRepository, PedidoItemRepository>();
            services.AddScoped<IProdutoRepository, ProdutoRepository>();
            services.AddScoped<IProdutoLojaRepository, ProdutoLojaRepository>();
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();

            return services;
        }
    }
}


