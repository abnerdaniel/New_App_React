namespace Controle.Application.DTOs
{
    public class AtendimentoIAConfigsDTO
    {
        public bool IaEnabled { get; set; }
        public bool SendCustomerNumber { get; set; }
        public bool SendOrderSummary { get; set; }
        public bool OrderUpdates { get; set; }
        public bool BotWithoutIA { get; set; }
    }
}
