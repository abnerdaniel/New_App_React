using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressToLoja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bairro",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cep",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cidade",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Complemento",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Logradouro",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Numero",
                table: "Lojas",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bairro",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "Cep",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "Cidade",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "Complemento",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "Logradouro",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "Numero",
                table: "Lojas");
        }
    }
}
