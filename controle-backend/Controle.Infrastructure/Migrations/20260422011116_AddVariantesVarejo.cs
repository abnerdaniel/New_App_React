using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVariantesVarejo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProdutoVarianteId",
                table: "PedidoItems",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProdutoVariantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProdutoLojaId = table.Column<int>(type: "integer", nullable: false),
                    SKU = table.Column<string>(type: "text", nullable: false),
                    Preco = table.Column<int>(type: "integer", nullable: false),
                    Estoque = table.Column<int>(type: "integer", nullable: false),
                    Disponivel = table.Column<bool>(type: "boolean", nullable: false),
                    ImagemUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoVariantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProdutoVariantes_ProdutosLojas_ProdutoLojaId",
                        column: x => x.ProdutoLojaId,
                        principalTable: "ProdutosLojas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VarianteAtributos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LojaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VarianteAtributos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VarianteAtributoValores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VarianteAtributoId = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<string>(type: "text", nullable: false),
                    CodigoHex = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VarianteAtributoValores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VarianteAtributoValores_VarianteAtributos_VarianteAtributoId",
                        column: x => x.VarianteAtributoId,
                        principalTable: "VarianteAtributos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProdutoVarianteAtributos",
                columns: table => new
                {
                    ProdutoVarianteId = table.Column<int>(type: "integer", nullable: false),
                    VarianteAtributoValorId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoVarianteAtributos", x => new { x.ProdutoVarianteId, x.VarianteAtributoValorId });
                    table.ForeignKey(
                        name: "FK_ProdutoVarianteAtributos_ProdutoVariantes_ProdutoVarianteId",
                        column: x => x.ProdutoVarianteId,
                        principalTable: "ProdutoVariantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProdutoVarianteAtributos_VarianteAtributoValores_VarianteAt~",
                        column: x => x.VarianteAtributoValorId,
                        principalTable: "VarianteAtributoValores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoVarianteAtributos_VarianteAtributoValorId",
                table: "ProdutoVarianteAtributos",
                column: "VarianteAtributoValorId");

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoVariantes_ProdutoLojaId",
                table: "ProdutoVariantes",
                column: "ProdutoLojaId");

            migrationBuilder.CreateIndex(
                name: "IX_VarianteAtributoValores_VarianteAtributoId",
                table: "VarianteAtributoValores",
                column: "VarianteAtributoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProdutoVarianteAtributos");

            migrationBuilder.DropTable(
                name: "ProdutoVariantes");

            migrationBuilder.DropTable(
                name: "VarianteAtributoValores");

            migrationBuilder.DropTable(
                name: "VarianteAtributos");

            migrationBuilder.DropColumn(
                name: "ProdutoVarianteId",
                table: "PedidoItems");
        }
    }
}
