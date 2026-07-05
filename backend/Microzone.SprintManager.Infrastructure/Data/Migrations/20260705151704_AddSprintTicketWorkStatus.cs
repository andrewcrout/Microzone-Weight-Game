using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Microzone.SprintManager.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSprintTicketWorkStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WorkStatus",
                table: "SprintTickets",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Not Started");

            migrationBuilder.Sql("UPDATE SprintTickets SET WorkStatus = 'Not Started' WHERE WorkStatus = '' OR WorkStatus IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkStatus",
                table: "SprintTickets");
        }
    }
}
