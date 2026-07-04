using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Microzone.SprintManager.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Detail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sprints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Goal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sprints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrelloBoardConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    BoardId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BaseUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrelloBoardConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WeightCards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WeightValue = table.Column<int>(type: "int", nullable: false),
                    TimeScore = table.Column<int>(type: "int", nullable: false),
                    TimeLabel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EstimatedTime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Element = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Line = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeightCards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GroomingSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SprintId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentTicketIndex = table.Column<int>(type: "int", nullable: false),
                    VotesRevealed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroomingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroomingSessions_Sprints_SprintId",
                        column: x => x.SprintId,
                        principalTable: "Sprints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintTickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SprintId = table.Column<int>(type: "int", nullable: false),
                    TrelloCardId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    BoardId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ListId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShortUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    WeightValue = table.Column<int>(type: "int", nullable: true),
                    TimeScore = table.Column<int>(type: "int", nullable: true),
                    GroomingStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DueDateUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintTickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintTickets_Sprints_SprintId",
                        column: x => x.SprintId,
                        principalTable: "Sprints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrelloImportRuns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SprintId = table.Column<int>(type: "int", nullable: false),
                    ImportedTicketCount = table.Column<int>(type: "int", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UsedMockData = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrelloImportRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrelloImportRuns_Sprints_SprintId",
                        column: x => x.SprintId,
                        principalTable: "Sprints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroomingParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroomingSessionId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsReady = table.Column<bool>(type: "bit", nullable: false),
                    IsAdmin = table.Column<bool>(type: "bit", nullable: false),
                    ConnectionId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroomingParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroomingParticipants_GroomingSessions_GroomingSessionId",
                        column: x => x.GroomingSessionId,
                        principalTable: "GroomingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroomingParticipants_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroomingVotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroomingSessionId = table.Column<int>(type: "int", nullable: false),
                    SprintTicketId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    WeightValue = table.Column<int>(type: "int", nullable: false),
                    IsFinalized = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroomingVotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroomingVotes_GroomingSessions_GroomingSessionId",
                        column: x => x.GroomingSessionId,
                        principalTable: "GroomingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroomingVotes_SprintTickets_SprintTicketId",
                        column: x => x.SprintTicketId,
                        principalTable: "SprintTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroomingVotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintTicketAssignees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SprintTicketId = table.Column<int>(type: "int", nullable: false),
                    TrelloMemberId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintTicketAssignees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintTicketAssignees_SprintTickets_SprintTicketId",
                        column: x => x.SprintTicketId,
                        principalTable: "SprintTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintTicketComments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SprintTicketId = table.Column<int>(type: "int", nullable: false),
                    AuthorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintTicketComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintTicketComments_SprintTickets_SprintTicketId",
                        column: x => x.SprintTicketId,
                        principalTable: "SprintTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintTicketLabels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SprintTicketId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintTicketLabels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintTicketLabels_SprintTickets_SprintTicketId",
                        column: x => x.SprintTicketId,
                        principalTable: "SprintTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAtUtc", "Name", "UpdatedAtUtc" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(2870), "Admin", null },
                    { 2, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(3813), "Developer", null },
                    { 3, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(4124), "Viewer", null }
                });

            migrationBuilder.InsertData(
                table: "SystemDefinitions",
                columns: new[] { "Id", "CreatedAtUtc", "Name", "UpdatedAtUtc" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9415), "PROMAN - IAR NC", null },
                    { 2, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9918), "PROMAN - PW NC", null },
                    { 3, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9931), "PROMAN - DASHBOARD", null },
                    { 4, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9939), "PROMAN GENERAL", null },
                    { 5, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9946), "PROMAN - ROADS NC", null },
                    { 6, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9966), "DOCSIGN - APP", null },
                    { 7, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9977), "PROMAN - IDENTITY", null },
                    { 8, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9989), "PROMAN - ADMIN", null },
                    { 9, new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9998), "SMOKE SIGNAL - APP", null },
                    { 10, new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(14), "PROMAN - PORTFOLIO MANAGEMENT (UAMP)", null },
                    { 11, new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(24), "CRICKET CLINIC", null },
                    { 12, new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(35), "PROMAN - CALL LOGS NC", null },
                    { 13, new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(46), "ROADS - APP", null },
                    { 14, new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(56), "PROMAN - FILE SYSTEM", null }
                });

            migrationBuilder.InsertData(
                table: "WeightCards",
                columns: new[] { "Id", "CreatedAtUtc", "Element", "EstimatedTime", "Line", "TimeLabel", "TimeScore", "UpdatedAtUtc", "WeightValue" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(2227), "Lightning", "Half Day", "Blink and it's done.", "Super Quick Fix", 0, null, 1 },
                    { 2, new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6384), "Water", "1 day", "Smooth and steady.", "Quick Fix", 1, null, 2 },
                    { 3, new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6409), "Plant", "2 - 3 days", "Needs room to grow.", "Medium Fix", 2, null, 4 },
                    { 4, new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6412), "Fire", "3 - 4 days", "This one brings heat.", "Long Fix", 3, null, 8 },
                    { 5, new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6415), "Rock", "5 - 12 days", "Hard as a rock.", "Super Fix", 4, null, 13 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroomingParticipants_GroomingSessionId_UserId",
                table: "GroomingParticipants",
                columns: new[] { "GroomingSessionId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroomingParticipants_UserId",
                table: "GroomingParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroomingSessions_SprintId",
                table: "GroomingSessions",
                column: "SprintId");

            migrationBuilder.CreateIndex(
                name: "IX_GroomingVotes_GroomingSessionId_SprintTicketId_UserId",
                table: "GroomingVotes",
                columns: new[] { "GroomingSessionId", "SprintTicketId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroomingVotes_SprintTicketId",
                table: "GroomingVotes",
                column: "SprintTicketId");

            migrationBuilder.CreateIndex(
                name: "IX_GroomingVotes_UserId",
                table: "GroomingVotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SprintTicketAssignees_SprintTicketId",
                table: "SprintTicketAssignees",
                column: "SprintTicketId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintTicketComments_SprintTicketId",
                table: "SprintTicketComments",
                column: "SprintTicketId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintTicketLabels_SprintTicketId",
                table: "SprintTicketLabels",
                column: "SprintTicketId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintTickets_SprintId_TrelloCardId",
                table: "SprintTickets",
                columns: new[] { "SprintId", "TrelloCardId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrelloImportRuns_SprintId",
                table: "TrelloImportRuns",
                column: "SprintId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "GroomingParticipants");

            migrationBuilder.DropTable(
                name: "GroomingVotes");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "SprintTicketAssignees");

            migrationBuilder.DropTable(
                name: "SprintTicketComments");

            migrationBuilder.DropTable(
                name: "SprintTicketLabels");

            migrationBuilder.DropTable(
                name: "SystemDefinitions");

            migrationBuilder.DropTable(
                name: "TrelloBoardConfigs");

            migrationBuilder.DropTable(
                name: "TrelloImportRuns");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "WeightCards");

            migrationBuilder.DropTable(
                name: "GroomingSessions");

            migrationBuilder.DropTable(
                name: "SprintTickets");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Sprints");
        }
    }
}
