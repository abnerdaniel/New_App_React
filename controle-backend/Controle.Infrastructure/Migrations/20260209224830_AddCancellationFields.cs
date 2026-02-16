using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCancellationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MotivoCancelamento",
                table: "Pedidos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PermitirCancelamentoCliente",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "StatusMaximoCancelamento",
                table: "Lojas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PedidosCancelados",
                table: "CientesFinais",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_LojaId",
                table: "Pedidos",
                column: "LojaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Lojas_LojaId",
                table: "Pedidos",
                column: "LojaId",
                principalTable: "Lojas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Lojas_LojaId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_LojaId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "MotivoCancelamento",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "PermitirCancelamentoCliente",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "StatusMaximoCancelamento",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "PedidosCancelados",
                table: "CientesFinais");
        }
    }
}
