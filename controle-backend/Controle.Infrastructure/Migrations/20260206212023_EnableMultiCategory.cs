using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnableMultiCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProdutoCategorias",
                columns: table => new
                {
                    ProdutoLojaId = table.Column<int>(type: "integer", nullable: false),
                    CategoriaId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoCategorias", x => new { x.ProdutoLojaId, x.CategoriaId });
                    table.ForeignKey(
                        name: "FK_ProdutoCategorias_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProdutoCategorias_ProdutosLojas_ProdutoLojaId",
                        column: x => x.ProdutoLojaId,
                        principalTable: "ProdutosLojas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProdutosLojas_ProdutoId",
                table: "ProdutosLojas",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoCategorias_CategoriaId",
                table: "ProdutoCategorias",
                column: "CategoriaId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProdutosLojas_Produtos_ProdutoId",
                table: "ProdutosLojas",
                column: "ProdutoId",
                principalTable: "Produtos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProdutosLojas_Produtos_ProdutoId",
                table: "ProdutosLojas");

            migrationBuilder.DropTable(
                name: "ProdutoCategorias");

            migrationBuilder.DropIndex(
                name: "IX_ProdutosLojas_ProdutoId",
                table: "ProdutosLojas");
        }
    }
}
