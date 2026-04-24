using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModoCardapio",
                table: "ProdutosLojas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TipoProdutoId",
                table: "ProdutosLojas",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TiposProduto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LojaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Icone = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposProduto", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProdutosLojas_TipoProdutoId",
                table: "ProdutosLojas",
                column: "TipoProdutoId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProdutosLojas_TiposProduto_TipoProdutoId",
                table: "ProdutosLojas",
                column: "TipoProdutoId",
                principalTable: "TiposProduto",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProdutosLojas_TiposProduto_TipoProdutoId",
                table: "ProdutosLojas");

            migrationBuilder.DropTable(
                name: "TiposProduto");

            migrationBuilder.DropIndex(
                name: "IX_ProdutosLojas_TipoProdutoId",
                table: "ProdutosLojas");

            migrationBuilder.DropColumn(
                name: "ModoCardapio",
                table: "ProdutosLojas");

            migrationBuilder.DropColumn(
                name: "TipoProdutoId",
                table: "ProdutosLojas");
        }
    }
}
