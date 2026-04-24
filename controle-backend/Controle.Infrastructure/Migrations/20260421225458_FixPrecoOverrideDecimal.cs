using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixPrecoOverrideDecimal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "PrecoOverride",
                table: "ProdutoAdicionais",
                type: "numeric",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "PrecoOverride",
                table: "ProdutoAdicionais",
                type: "integer",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric",
                oldNullable: true);
        }
    }
}
