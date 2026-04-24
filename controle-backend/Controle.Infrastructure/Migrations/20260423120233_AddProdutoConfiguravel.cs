using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProdutoConfiguravel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GruposOpcao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProdutoLojaId = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    MinSelecao = table.Column<int>(type: "integer", nullable: false),
                    MaxSelecao = table.Column<int>(type: "integer", nullable: false),
                    Obrigatorio = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GruposOpcao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GruposOpcao_ProdutosLojas_ProdutoLojaId",
                        column: x => x.ProdutoLojaId,
                        principalTable: "ProdutosLojas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpcaoItens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GrupoOpcaoId = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Preco = table.Column<int>(type: "integer", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpcaoItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpcaoItens_GruposOpcao_GrupoOpcaoId",
                        column: x => x.GrupoOpcaoId,
                        principalTable: "GruposOpcao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PedidoItemOpcoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PedidoItemId = table.Column<int>(type: "integer", nullable: false),
                    OpcaoItemId = table.Column<int>(type: "integer", nullable: false),
                    NomeGrupo = table.Column<string>(type: "text", nullable: false),
                    NomeOpcao = table.Column<string>(type: "text", nullable: false),
                    PrecoUnitario = table.Column<int>(type: "integer", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PedidoItemOpcoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PedidoItemOpcoes_OpcaoItens_OpcaoItemId",
                        column: x => x.OpcaoItemId,
                        principalTable: "OpcaoItens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PedidoItemOpcoes_PedidoItems_PedidoItemId",
                        column: x => x.PedidoItemId,
                        principalTable: "PedidoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GruposOpcao_ProdutoLojaId",
                table: "GruposOpcao",
                column: "ProdutoLojaId");

            migrationBuilder.CreateIndex(
                name: "IX_OpcaoItens_GrupoOpcaoId",
                table: "OpcaoItens",
                column: "GrupoOpcaoId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItemOpcoes_OpcaoItemId",
                table: "PedidoItemOpcoes",
                column: "OpcaoItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItemOpcoes_PedidoItemId",
                table: "PedidoItemOpcoes",
                column: "PedidoItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PedidoItemOpcoes");

            migrationBuilder.DropTable(
                name: "OpcaoItens");

            migrationBuilder.DropTable(
                name: "GruposOpcao");
        }
    }
}
