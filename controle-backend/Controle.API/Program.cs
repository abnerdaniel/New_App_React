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
        policy => policy.WithOrigins("http://localhost:5174") 
                         .AllowAnyMethod()
                         .AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowReactApp");
app.UseSwaggerDocumentation();
app.UseAuthentication();
app.UseAuthorization();
app.UseApplicationMiddleware();

app.Run();