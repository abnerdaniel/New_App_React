using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderSummaryTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OrderSummaryTemplate",
                table: "Lojas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowAddressOnSummary",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowPaymentOnSummary",
                table: "Lojas",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrderSummaryTemplate",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "ShowAddressOnSummary",
                table: "Lojas");

            migrationBuilder.DropColumn(
                name: "ShowPaymentOnSummary",
                table: "Lojas");
        }
    }
}
