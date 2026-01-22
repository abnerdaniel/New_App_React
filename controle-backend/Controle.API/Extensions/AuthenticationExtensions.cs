using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Controle.API.Extensions;

public static class AuthenticationExtensions
{
    //public static IServiceCollection AddJwtAuthentication(
    //    this IServiceCollection services,
    //    IConfiguration configuration)
    //{
    //    var secretKey = configuration["Jwt:Key"];

    //    var key = Encoding.UTF8.GetBytes(secretKey);

    //    services.AddAuthentication(options =>
    //    {
    //        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    //        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    //    })
    //    .AddJwtBearer(options =>
    //    {
    //        options.RequireHttpsMetadata = false;
    //        options.SaveToken = true;

    //        options.TokenValidationParameters = new TokenValidationParameters
    //        {
    //            ValidateIssuer = false,
    //            ValidateAudience = false,
    //            ValidateIssuerSigningKey = true,
    //            ValidateLifetime = true,
    //            IssuerSigningKey = new SymmetricSecurityKey(key)
    //        };
    //    });

    //    return services;
    //}
}
