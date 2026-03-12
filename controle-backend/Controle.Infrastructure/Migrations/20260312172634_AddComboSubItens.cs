using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddComboSubItens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentPedidoItemId",
                table: "PedidoItems",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItems_ParentPedidoItemId",
                table: "PedidoItems",
                column: "ParentPedidoItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_PedidoItems_ParentPedidoItemId",
                table: "PedidoItems",
                column: "ParentPedidoItemId",
                principalTable: "PedidoItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_PedidoItems_ParentPedidoItemId",
                table: "PedidoItems");

            migrationBuilder.DropIndex(
                name: "IX_PedidoItems_ParentPedidoItemId",
                table: "PedidoItems");

            migrationBuilder.DropColumn(
                name: "ParentPedidoItemId",
                table: "PedidoItems");
        }
    }
}
