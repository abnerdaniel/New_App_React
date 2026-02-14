using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMesaDataAbertura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataAbertura",
                table: "Mesas",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataAbertura",
                table: "Mesas");
        }
    }
}
