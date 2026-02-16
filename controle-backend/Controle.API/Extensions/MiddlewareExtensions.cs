namespace Controle.API.Extensions
{
    public static class MiddlewareExtensions
    {
        public static WebApplication UseApplicationMiddleware(this WebApplication app)
        {
            app.UseMiddleware<Middlewares.ExceptionMiddleware>();
            
            // app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            return app;
        }
    }
}
