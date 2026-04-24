using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImagensAndAdicionaisQuantidade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PrecoOverride",
                table: "ProdutoAdicionais",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeMaxima",
                table: "ProdutoAdicionais",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeMinima",
                table: "ProdutoAdicionais",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "PedidoItemAdicionais",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PrecoAdicional",
                table: "PedidoItemAdicionais",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PrecoUnitario",
                table: "PedidoItemAdicionais",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Quantidade",
                table: "PedidoItemAdicionais",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ProdutoImagens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProdutoLojaId = table.Column<int>(type: "integer", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoImagens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProdutoImagens_ProdutosLojas_ProdutoLojaId",
                        column: x => x.ProdutoLojaId,
                        principalTable: "ProdutosLojas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoImagens_ProdutoLojaId",
                table: "ProdutoImagens",
                column: "ProdutoLojaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProdutoImagens");

            migrationBuilder.DropColumn(
                name: "PrecoOverride",
                table: "ProdutoAdicionais");

            migrationBuilder.DropColumn(
                name: "QuantidadeMaxima",
                table: "ProdutoAdicionais");

            migrationBuilder.DropColumn(
                name: "QuantidadeMinima",
                table: "ProdutoAdicionais");

            migrationBuilder.DropColumn(
                name: "Nome",
                table: "PedidoItemAdicionais");

            migrationBuilder.DropColumn(
                name: "PrecoAdicional",
                table: "PedidoItemAdicionais");

            migrationBuilder.DropColumn(
                name: "PrecoUnitario",
                table: "PedidoItemAdicionais");

            migrationBuilder.DropColumn(
                name: "Quantidade",
                table: "PedidoItemAdicionais");
        }
    }
}
