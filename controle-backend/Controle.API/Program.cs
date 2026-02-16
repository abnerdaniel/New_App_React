using Microsoft.EntityFrameworkCore;
using Controle.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
// 1. Banco de Dados/Injeção de Dependência
builder.Services.AddApplicationServices(builder.Configuration);
// 2. Autenticação JWT
builder.Services.AddJwtAuthentication(builder.Configuration);
// 3. Swagger / OpenAPI
builder.Services.AddSwaggerDocumentation();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.SetIsOriginAllowed(origin => true) // Permite qualquer origem em desenvolvimento
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()); // Importante para cookies/auth se necessário, mas requer SetIsOriginAllowed ou origens específicas
});

var app = builder.Build();

// 4. Exception Handling
app.UseMiddleware<Controle.API.Middlewares.ExceptionMiddleware>(); // Capture exceptions globally

app.UseCors("AllowReactApp");
app.UseSwaggerDocumentation();
app.UseAuthentication();
app.UseAuthorization();
app.UseApplicationMiddleware();

// Seeding de Cargos
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var cargoRepository = services.GetRequiredService<Controle.Domain.Interfaces.ICargoRepository>();
        var cargos = await cargoRepository.GetAllAsync();
        if (!cargos.Any())
        {
            await cargoRepository.AddAsync(new Controle.Domain.Entities.Cargo { Nome = "Administrador" });
            await cargoRepository.AddAsync(new Controle.Domain.Entities.Cargo { Nome = "Gerente" });
            await cargoRepository.AddAsync(new Controle.Domain.Entities.Cargo { Nome = "Garçom" });
            await cargoRepository.AddAsync(new Controle.Domain.Entities.Cargo { Nome = "Cozinha" });
            await cargoRepository.AddAsync(new Controle.Domain.Entities.Cargo { Nome = "Entregador" });
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erro ao semear cargos: {ex.Message}");
    }
}

app.Run();