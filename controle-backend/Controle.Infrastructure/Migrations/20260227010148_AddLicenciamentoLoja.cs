using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLicenciamentoLoja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "BloqueadaPorFaltaDePagamento",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LicencaValidaAte",
                table: "Lojas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UrlComprovantePagamento",
                table: "Lojas",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BloqueadaPorFaltaDePagamento",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "LicencaValidaAte",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "UrlComprovantePagamento",
                table: "Lojas");
        }
    }
}
