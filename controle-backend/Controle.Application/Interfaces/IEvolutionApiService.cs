using System.Threading.Tasks;

namespace Controle.Application.Interfaces
{
    public interface IEvolutionApiService
    {
        Task<EvolutionCreateInstanceResponse?> CreateInstanceAsync(string instanceName);
        Task<bool> SetWebhookAsync(string instanceName);
        Task<bool> LogoutInstanceAsync(string instanceName);
        Task<bool> DeleteInstanceAsync(string instanceName);
        Task<EvolutionInstanceStatusResponse?> GetInstanceStatusAsync(string instanceName);
        Task<string?> GetConnectQrCodeAsync(string instanceName);
        Task<bool> SendTextAsync(string instanceName, string number, string text);
    }

    public class EvolutionCreateInstanceResponse
    {
        public bool Success { get; set; }
        public string? QrCodeBase64 { get; set; }
        public string? InstanceName { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class EvolutionInstanceStatusResponse
    {
        public string State { get; set; } = string.Empty; // "open", "close", "connecting"
        public string StatusReason { get; set; } = string.Empty;
        public string? OwnerPhone { get; set; }
    }
}
