using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMesas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LojaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Numero = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: true),
                    ClienteNomeTemporario = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PedidoAtualId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mesas_Pedidos_PedidoAtualId",
                        column: x => x.PedidoAtualId,
                        principalTable: "Pedidos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_ClienteId",
                table: "Pedidos",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_EnderecoDeEntregaId",
                table: "Pedidos",
                column: "EnderecoDeEntregaId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItems_ProdutoLojaId",
                table: "PedidoItems",
                column: "ProdutoLojaId");

            migrationBuilder.CreateIndex(
                name: "IX_Mesas_PedidoAtualId",
                table: "Mesas",
                column: "PedidoAtualId");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_ProdutosLojas_ProdutoLojaId",
                table: "PedidoItems",
                column: "ProdutoLojaId",
                principalTable: "ProdutosLojas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_CientesFinais_ClienteId",
                table: "Pedidos",
                column: "ClienteId",
                principalTable: "CientesFinais",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Enderecos_EnderecoDeEntregaId",
                table: "Pedidos",
                column: "EnderecoDeEntregaId",
                principalTable: "Enderecos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_ProdutosLojas_ProdutoLojaId",
                table: "PedidoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_CientesFinais_ClienteId",
                table: "Pedidos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Enderecos_EnderecoDeEntregaId",
                table: "Pedidos");

            migrationBuilder.DropTable(
                name: "Mesas");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_ClienteId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_EnderecoDeEntregaId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_PedidoItems_ProdutoLojaId",
                table: "PedidoItems");
        }
    }
}
