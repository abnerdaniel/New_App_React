using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Controle.Application.Interfaces;

namespace Controle.API.Controllers
{
    [ApiController]
    [Route("api/loja/{lojaId}/whatsapp")]
    [Authorize]
    public class WhatsAppIntegrationController : ControllerBase
    {
        private readonly IEvolutionApiService _evolutionService;
        private readonly ILojaService _lojaService;

        public WhatsAppIntegrationController(IEvolutionApiService evolutionService, ILojaService lojaService)
        {
            _evolutionService = evolutionService;
            _lojaService = lojaService;
        }

        [HttpPost("connect")]
        public async Task<IActionResult> Connect(Guid lojaId)
        {
            var loja = await _lojaService.GetLojaByIdAsync(lojaId);
            if (loja == null) return NotFound();

            if (string.IsNullOrEmpty(loja.EvolutionInstanceName))
            {
                var telefoneFormatado = (loja.Telefone ?? loja.WhatsApp ?? "").Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");
                var nomeSemEspaco = loja.Nome.Replace(" ", "");
                loja.EvolutionInstanceName = $"{nomeSemEspaco}_{telefoneFormatado}";
            }

            var response = await _evolutionService.CreateInstanceAsync(loja.EvolutionInstanceName);
            string? qrCode = response?.QrCodeBase64;
            
            if (response == null || !response.Success)
            {
                // Fallback: If instance already exists, just fetch the new QR Code
                qrCode = await _evolutionService.GetConnectQrCodeAsync(loja.EvolutionInstanceName);
                if (string.IsNullOrEmpty(qrCode))
                {
                    return BadRequest(new { message = "Falha ao obter QR Code da instância", details = response?.ErrorMessage });
                }
            }

            loja.EvolutionConnectionStatus = "PENDING_QR";
            await _lojaService.AtualizarLojaDirectAsync(loja);
            
            await _evolutionService.SetWebhookAsync(loja.EvolutionInstanceName);

            return Ok(new { qrcode = qrCode, status = loja.EvolutionConnectionStatus });
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus(Guid lojaId)
        {
            var loja = await _lojaService.GetLojaByIdAsync(lojaId);
            if (loja == null) return NotFound();

            if (string.IsNullOrEmpty(loja.EvolutionInstanceName))
            {
                return Ok(new { status = "DISCONNECTED" });
            }

            var evoStatus = await _evolutionService.GetInstanceStatusAsync(loja.EvolutionInstanceName);
            if (evoStatus == null)
            {
                return Ok(new { status = loja.EvolutionConnectionStatus });
            }

            var currentState = loja.EvolutionConnectionStatus;

            if (evoStatus.State == "open")
            {
                currentState = "CONNECTED";
                
                var telefoneLoja = (loja.Telefone ?? loja.WhatsApp ?? "").Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");
                if (telefoneLoja.StartsWith("0")) telefoneLoja = telefoneLoja.Substring(1); 
                
                if (!string.IsNullOrEmpty(evoStatus.OwnerPhone) && !string.IsNullOrEmpty(telefoneLoja))
                {
                    if (!evoStatus.OwnerPhone.Contains(telefoneLoja))
                    {
                        await _evolutionService.LogoutInstanceAsync(loja.EvolutionInstanceName);
                        await _evolutionService.DeleteInstanceAsync(loja.EvolutionInstanceName);
                        
                        loja.EvolutionConnectionStatus = "DISCONNECTED";
                        loja.EvolutionInstanceName = null;
                        await _lojaService.AtualizarLojaDirectAsync(loja);

                        return BadRequest(new { 
                            error = "INVALID_PHONE", 
                            message = $"O WhatsApp conectado não pertence ao painel da loja. Corrija nos cadastros de Gerenciar Lojas." 
                        });
                    }
                }
            }
            else if (evoStatus.State == "connecting")
            {
                currentState = "PENDING_QR";
            }
            else if (evoStatus.State == "close")
            {
                currentState = "DISCONNECTED";
            }

            if (currentState != loja.EvolutionConnectionStatus)
            {
                loja.EvolutionConnectionStatus = currentState;
                await _lojaService.AtualizarLojaDirectAsync(loja);
            }

            return Ok(new { status = loja.EvolutionConnectionStatus });
        }

        [HttpDelete("disconnect")]
        public async Task<IActionResult> Disconnect(Guid lojaId)
        {
            var loja = await _lojaService.GetLojaByIdAsync(lojaId);
            if (loja == null) return NotFound();

            if (!string.IsNullOrEmpty(loja.EvolutionInstanceName))
            {
                await _evolutionService.LogoutInstanceAsync(loja.EvolutionInstanceName);
                await _evolutionService.DeleteInstanceAsync(loja.EvolutionInstanceName);
            }

            loja.EvolutionConnectionStatus = "DISCONNECTED";
            loja.EvolutionInstanceName = null;
            await _lojaService.AtualizarLojaDirectAsync(loja);

            return Ok(new { status = "DISCONNECTED" });
        }
    }
}
