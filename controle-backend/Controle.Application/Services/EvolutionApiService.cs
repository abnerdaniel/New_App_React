using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Controle.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Controle.Application.Services
{
    public class EvolutionApiService : IEvolutionApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly string _apiKey;
        private readonly string _webhookUrl;

        public EvolutionApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            
            _baseUrl = configuration["EvolutionApi:BaseUrl"] ?? throw new ArgumentNullException("EvolutionApi:BaseUrl configuration is missing");
            _apiKey = configuration["EvolutionApi:ApiKey"] ?? throw new ArgumentNullException("EvolutionApi:ApiKey configuration is missing");
            _webhookUrl = configuration["EvolutionApi:WebhookUrl"] ?? throw new ArgumentNullException("EvolutionApi:WebhookUrl configuration is missing");

            _httpClient.BaseAddress = new Uri(_baseUrl);
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("apikey", _apiKey);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<EvolutionCreateInstanceResponse?> CreateInstanceAsync(string instanceName)
        {
            try
            {
                var payload = new
                {
                    instanceName = instanceName,
                    token = Guid.NewGuid().ToString(), // Arbitrary token requested by Evo
                    qrcode = true,
                    integration = "WHATSAPP-BAILEYS"
                };

                var response = await _httpClient.PostAsJsonAsync($"/instance/create", payload);
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = await response.Content.ReadAsStringAsync();
                    return new EvolutionCreateInstanceResponse { Success = false, ErrorMessage = errorResponse, InstanceName = instanceName };
                }

                var content = await response.Content.ReadAsStringAsync();
                using var jsonDoc = JsonDocument.Parse(content);
                var root = jsonDoc.RootElement;
                
                string? qrcode = null;
                if (root.TryGetProperty("qrcode", out var qrcodeObj) && qrcodeObj.TryGetProperty("base64", out var base64Obj))
                {
                    qrcode = base64Obj.GetString();
                }

                return new EvolutionCreateInstanceResponse
                {
                    Success = true,
                    InstanceName = instanceName,
                    QrCodeBase64 = qrcode
                };
            }
            catch (Exception ex)
            {
                return new EvolutionCreateInstanceResponse { Success = false, ErrorMessage = ex.Message, InstanceName = instanceName };
            }
        }

        public async Task<bool> SetWebhookAsync(string instanceName)
        {
            try
            {
                var payload = new
                {
                    webhook = new
                    {
                        enabled = true,
                        url = _webhookUrl,
                        byEvents = false,
                        base64 = false,
                        events = new string[] {
                            "MESSAGES_UPSERT",
                            "SEND_MESSAGE"
                        }
                    }
                };

                var response = await _httpClient.PostAsJsonAsync($"/webhook/set/{instanceName}", payload);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<EvolutionInstanceStatusResponse?> GetInstanceStatusAsync(string instanceName)
        {
            try
            {
                // Evolution v2 status API format
                var response = await _httpClient.GetAsync($"/instance/connectionState/{instanceName}");
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync();
                
                // Content JSON structure for Evo API v2 ConnectionState
                using var jsonDoc = JsonDocument.Parse(content);
                var root = jsonDoc.RootElement;
                
                var stateObj = root.GetProperty("instance");
                string state = stateObj.GetProperty("state").GetString() ?? "";

                // Get phone number from owner if available
                string? ownerPhone = null;
                try 
                {
                    // Fetch full instance data to get owner number if connected
                    if (state == "open" || state == "connecting") 
                    {
                        var fullResponse = await _httpClient.GetAsync($"/instance/fetchInstances?instanceName={instanceName}");
                        if (fullResponse.IsSuccessStatusCode)
                        {
                            var fullContent = await fullResponse.Content.ReadAsStringAsync();
                            using var fullDoc = JsonDocument.Parse(fullContent);
                            if (fullDoc.RootElement.ValueKind == JsonValueKind.Array && fullDoc.RootElement.GetArrayLength() > 0)
                            {
                                var instanceData = fullDoc.RootElement[0];
                                if (instanceData.TryGetProperty("owner", out var ownerProp))
                                {
                                    // Usually formatting: 551199999999@s.whatsapp.net
                                    ownerPhone = ownerProp.GetString()?.Split('@')[0];
                                }
                            }
                        }
                    }
                }
                catch { }

                return new EvolutionInstanceStatusResponse
                {
                    State = state,
                    OwnerPhone = ownerPhone
                };
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> LogoutInstanceAsync(string instanceName)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"/instance/logout/{instanceName}");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteInstanceAsync(string instanceName)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"/instance/delete/{instanceName}");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string?> GetConnectQrCodeAsync(string instanceName)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/instance/connect/{instanceName}");
                if (!response.IsSuccessStatusCode) return null;

                var content = await response.Content.ReadAsStringAsync();
                using var jsonDoc = JsonDocument.Parse(content);
                var root = jsonDoc.RootElement;
                
                if (root.TryGetProperty("base64", out var base64Obj))
                {
                    return base64Obj.GetString();
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> SendTextAsync(string instanceName, string number, string text)
        {
            try
            {
                var payload = new
                {
                    number = number,
                    text = text
                };

                var response = await _httpClient.PostAsJsonAsync($"/message/sendText/{instanceName}", payload);
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[EVOLUTION API ERROR] Failed to send message: {response.StatusCode} - {errorContent}");
                }
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EVOLUTION API EXCEPTION] {ex.Message}");
                return false;
            }
        }
    }
}
