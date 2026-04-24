using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddComboEtapas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ComboEtapas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ComboId = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "text", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    MinEscolhas = table.Column<int>(type: "integer", nullable: false),
                    MaxEscolhas = table.Column<int>(type: "integer", nullable: false),
                    Obrigatorio = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComboEtapas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComboEtapas_Combos_ComboId",
                        column: x => x.ComboId,
                        principalTable: "Combos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ComboEtapaOpcoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ComboEtapaId = table.Column<int>(type: "integer", nullable: false),
                    ProdutoLojaId = table.Column<int>(type: "integer", nullable: false),
                    PrecoAdicional = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComboEtapaOpcoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComboEtapaOpcoes_ComboEtapas_ComboEtapaId",
                        column: x => x.ComboEtapaId,
                        principalTable: "ComboEtapas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComboEtapaOpcoes_ProdutosLojas_ProdutoLojaId",
                        column: x => x.ProdutoLojaId,
                        principalTable: "ProdutosLojas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComboEtapaOpcoes_ComboEtapaId",
                table: "ComboEtapaOpcoes",
                column: "ComboEtapaId");

            migrationBuilder.CreateIndex(
                name: "IX_ComboEtapaOpcoes_ProdutoLojaId",
                table: "ComboEtapaOpcoes",
                column: "ProdutoLojaId");

            migrationBuilder.CreateIndex(
                name: "IX_ComboEtapas_ComboId",
                table: "ComboEtapas",
                column: "ComboId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComboEtapaOpcoes");

            migrationBuilder.DropTable(
                name: "ComboEtapas");
        }
    }
}
