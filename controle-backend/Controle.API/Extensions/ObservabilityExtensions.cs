using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;

namespace Controle.API.Extensions;

public static class ObservabilityExtensions
{
    public static IServiceCollection AddObservability(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var otelEndpoint = configuration["OpenTelemetry:Endpoint"]
            ?? "http://otel-collector:4317";

        services.AddOpenTelemetry()
            .ConfigureResource(r => r.AddService("LanchoneteAPI"))
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()
                .AddOtlpExporter(opts =>
                    opts.Endpoint = new Uri(otelEndpoint)));

        return services;
    }
}
