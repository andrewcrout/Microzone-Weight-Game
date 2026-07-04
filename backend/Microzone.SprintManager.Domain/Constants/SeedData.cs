using Microzone.SprintManager.Domain.Entities;

namespace Microzone.SprintManager.Domain.Constants;

public static class SeedData
{
    public const string DefaultAdminEmail = "admin@microzone.local";
    public const string DefaultAdminPassword = "Admin123!";

    public static readonly string[] Roles = ["Admin", "Developer", "Viewer"];

    public static readonly string[] Systems =
    [
        "PROMAN - IAR NC",
        "PROMAN - PW NC",
        "PROMAN - DASHBOARD",
        "PROMAN GENERAL",
        "PROMAN - ROADS NC",
        "DOCSIGN - APP",
        "PROMAN - IDENTITY",
        "PROMAN - ADMIN",
        "SMOKE SIGNAL - APP",
        "PROMAN - PORTFOLIO MANAGEMENT (UAMP)",
        "CRICKET CLINIC",
        "PROMAN - CALL LOGS NC",
        "ROADS - APP",
        "PROMAN - FILE SYSTEM"
    ];

    public static readonly WeightCard[] WeightCards =
    [
        new() { Id = 1, WeightValue = 1, TimeScore = 0, TimeLabel = "Super Quick Fix", EstimatedTime = "Half Day", Element = "Lightning", Line = "Blink and it's done." },
        new() { Id = 2, WeightValue = 2, TimeScore = 1, TimeLabel = "Quick Fix", EstimatedTime = "1 day", Element = "Water", Line = "Smooth and steady." },
        new() { Id = 3, WeightValue = 4, TimeScore = 2, TimeLabel = "Medium Fix", EstimatedTime = "2 - 3 days", Element = "Plant", Line = "Needs room to grow." },
        new() { Id = 4, WeightValue = 8, TimeScore = 3, TimeLabel = "Long Fix", EstimatedTime = "3 - 4 days", Element = "Fire", Line = "This one brings heat." },
        new() { Id = 5, WeightValue = 13, TimeScore = 4, TimeLabel = "Super Fix", EstimatedTime = "5 - 12 days", Element = "Rock", Line = "Hard as a rock." }
    ];
}
