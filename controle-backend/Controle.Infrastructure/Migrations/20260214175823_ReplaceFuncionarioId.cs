using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceFuncionarioId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AtendenteId",
                table: "Pedidos");

            migrationBuilder.RenameColumn(
                name: "GarcomId",
                table: "Pedidos",
                newName: "FuncionarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_FuncionarioId",
                table: "Pedidos",
                column: "FuncionarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Funcionarios_FuncionarioId",
                table: "Pedidos",
                column: "FuncionarioId",
                principalTable: "Funcionarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Funcionarios_FuncionarioId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_FuncionarioId",
                table: "Pedidos");

            migrationBuilder.RenameColumn(
                name: "FuncionarioId",
                table: "Pedidos",
                newName: "GarcomId");

            migrationBuilder.AddColumn<int>(
                name: "AtendenteId",
                table: "Pedidos",
                type: "integer",
                nullable: true);
        }
    }
}
