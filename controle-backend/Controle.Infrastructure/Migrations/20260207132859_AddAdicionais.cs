using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdicionais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAdicional",
                table: "Produtos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PedidoItemAdicionais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PedidoItemId = table.Column<int>(type: "integer", nullable: false),
                    ProdutoLojaId = table.Column<int>(type: "integer", nullable: false),
                    PrecoVenda = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PedidoItemAdicionais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PedidoItemAdicionais_PedidoItems_PedidoItemId",
                        column: x => x.PedidoItemId,
                        principalTable: "PedidoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PedidoItemAdicionais_ProdutosLojas_ProdutoLojaId",
                        column: x => x.ProdutoLojaId,
                        principalTable: "ProdutosLojas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProdutoAdicionais",
                columns: table => new
                {
                    ProdutoPaiId = table.Column<int>(type: "integer", nullable: false),
                    ProdutoFilhoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoAdicionais", x => new { x.ProdutoPaiId, x.ProdutoFilhoId });
                    table.ForeignKey(
                        name: "FK_ProdutoAdicionais_Produtos_ProdutoFilhoId",
                        column: x => x.ProdutoFilhoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProdutoAdicionais_Produtos_ProdutoPaiId",
                        column: x => x.ProdutoPaiId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItemAdicionais_PedidoItemId",
                table: "PedidoItemAdicionais",
                column: "PedidoItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItemAdicionais_ProdutoLojaId",
                table: "PedidoItemAdicionais",
                column: "ProdutoLojaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoAdicionais_ProdutoFilhoId",
                table: "ProdutoAdicionais",
                column: "ProdutoFilhoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PedidoItemAdicionais");

            migrationBuilder.DropTable(
                name: "ProdutoAdicionais");

            migrationBuilder.DropColumn(
                name: "IsAdicional",
                table: "Produtos");
        }
    }
}
