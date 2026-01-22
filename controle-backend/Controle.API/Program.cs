using Microsoft.EntityFrameworkCore;
using Controle.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// 1. Banco de Dados/Injeção de Dependência
builder.Services.AddApplicationServices(builder.Configuration);
// 2. Swagger / OpenAPI
builder.Services.AddSwaggerDocumentation();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173") 
                         .AllowAnyMethod()
                         .AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowReactApp");
app.UseSwaggerDocumentation();
app.UseApplicationMiddleware();

app.Run();