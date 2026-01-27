using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Controle.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIdToUuidV7 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Truncate tables to clear data for type conversion
            migrationBuilder.Sql("TRUNCATE TABLE \"Usuarios\" RESTART IDENTITY CASCADE;");
            migrationBuilder.Sql("TRUNCATE TABLE \"Lojas\" RESTART IDENTITY CASCADE;");

            // Drop identity from ID columns
            migrationBuilder.Sql("ALTER TABLE \"Usuarios\" ALTER COLUMN \"Id\" DROP IDENTITY IF EXISTS;");
            migrationBuilder.Sql("ALTER TABLE \"Lojas\" ALTER COLUMN \"Id\" DROP IDENTITY IF EXISTS;");

            // Alter columns to UUID with USING clause
            migrationBuilder.Sql("ALTER TABLE \"Usuarios\" ALTER COLUMN \"Id\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"ProdutosLojas\" ALTER COLUMN \"LojaId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Produtos\" ALTER COLUMN \"LojaId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Pedidos\" ALTER COLUMN \"LojaId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Lojas\" ALTER COLUMN \"UsuarioId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Lojas\" ALTER COLUMN \"Id\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Funcionarios\" ALTER COLUMN \"UsuarioId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Funcionarios\" ALTER COLUMN \"LojaId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Enderecos\" ALTER COLUMN \"LojaId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Cardapios\" ALTER COLUMN \"LojaId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Bloqueios\" ALTER COLUMN \"LojaId\" TYPE uuid USING '00000000-0000-0000-0000-000000000000'::uuid;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Usuarios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "LojaId",
                table: "ProdutosLojas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "LojaId",
                table: "Produtos",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "LojaId",
                table: "Pedidos",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId",
                table: "Lojas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Lojas",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId",
                table: "Funcionarios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "LojaId",
                table: "Funcionarios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "LojaId",
                table: "Enderecos",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "LojaId",
                table: "Cardapios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<int>(
                name: "LojaId",
                table: "Bloqueios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }
    }
}
