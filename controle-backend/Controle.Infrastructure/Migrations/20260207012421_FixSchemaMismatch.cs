using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixSchemaMismatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Avaliacao",
                table: "Lojas",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Lojas",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Avaliacao",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Lojas");
        }
    }
}
