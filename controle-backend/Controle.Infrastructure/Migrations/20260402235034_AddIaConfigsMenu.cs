using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIaConfigsMenu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "BotWithoutIA",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IaEnabled",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "OrderUpdates",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SendCustomerNumber",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SendOrderSummary",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BotWithoutIA",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "IaEnabled",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "OrderUpdates",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "SendCustomerNumber",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "SendOrderSummary",
                table: "Lojas");
        }
    }
}
