using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixCancellationDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Alterar defaults das colunas se necessário (EF Core handles schema, we handle data)
            
            // Update existing rows to enable cancellation by default
            migrationBuilder.Sql("UPDATE \"Lojas\" SET \"PermitirCancelamentoCliente\" = true WHERE \"PermitirCancelamentoCliente\" = false");
            
            // Update existing rows to set max status to 'Saiu para Entrega' (if it was 'Pendente' or NULL/Empty)
            migrationBuilder.Sql("UPDATE \"Lojas\" SET \"StatusMaximoCancelamento\" = 'Saiu para Entrega' WHERE \"StatusMaximoCancelamento\" = 'Pendente' OR \"StatusMaximoCancelamento\" IS NULL OR \"StatusMaximoCancelamento\" = ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
