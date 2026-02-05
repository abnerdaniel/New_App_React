using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjusteCategoriaIdOpcional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categorias_Cardapios_CardapioId1",
                table: "Categorias");

            migrationBuilder.DropForeignKey(
                name: "FK_ProdutosLojas_Categorias_CategoriaId",
                table: "ProdutosLojas");

            migrationBuilder.DropIndex(
                name: "IX_Categorias_CardapioId1",
                table: "Categorias");

            migrationBuilder.DropColumn(
                name: "CardapioId1",
                table: "Categorias");

            migrationBuilder.AlterColumn<int>(
                name: "CategoriaId",
                table: "ProdutosLojas",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_ProdutosLojas_Categorias_CategoriaId",
                table: "ProdutosLojas",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProdutosLojas_Categorias_CategoriaId",
                table: "ProdutosLojas");

            migrationBuilder.AlterColumn<int>(
                name: "CategoriaId",
                table: "ProdutosLojas",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CardapioId1",
                table: "Categorias",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_CardapioId1",
                table: "Categorias",
                column: "CardapioId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Categorias_Cardapios_CardapioId1",
                table: "Categorias",
                column: "CardapioId1",
                principalTable: "Cardapios",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProdutosLojas_Categorias_CategoriaId",
                table: "ProdutosLojas",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
