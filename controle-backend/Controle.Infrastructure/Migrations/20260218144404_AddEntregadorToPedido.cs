using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEntregadorToPedido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EntregadorId",
                table: "Pedidos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AcessoSistemaCompleto",
                table: "Funcionarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Telefone",
                table: "Funcionarios",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_EntregadorId",
                table: "Pedidos",
                column: "EntregadorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Funcionarios_EntregadorId",
                table: "Pedidos",
                column: "EntregadorId",
                principalTable: "Funcionarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Funcionarios_EntregadorId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_EntregadorId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "EntregadorId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "AcessoSistemaCompleto",
                table: "Funcionarios");

            migrationBuilder.DropColumn(
                name: "Telefone",
                table: "Funcionarios");
        }
    }
}
