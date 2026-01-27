using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAbertaManualmenteToLoja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AbertaManualmente",
                table: "Lojas",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxaEntregaFixa",
                table: "Lojas",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxaPorKm",
                table: "Lojas",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TempoMaximoEntrega",
                table: "Lojas",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TempoMinimoEntrega",
                table: "Lojas",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CardapioId1",
                table: "Categorias",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProdutosLojas_CategoriaId",
                table: "ProdutosLojas",
                column: "CategoriaId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categorias_Cardapios_CardapioId1",
                table: "Categorias");

            migrationBuilder.DropForeignKey(
                name: "FK_ProdutosLojas_Categorias_CategoriaId",
                table: "ProdutosLojas");

            migrationBuilder.DropIndex(
                name: "IX_ProdutosLojas_CategoriaId",
                table: "ProdutosLojas");

            migrationBuilder.DropIndex(
                name: "IX_Categorias_CardapioId1",
                table: "Categorias");

            migrationBuilder.DropColumn(
                name: "AbertaManualmente",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "TaxaEntregaFixa",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "TaxaPorKm",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "TempoMaximoEntrega",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "TempoMinimoEntrega",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "CardapioId1",
                table: "Categorias");
        }
    }
}
