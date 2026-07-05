using Microzone.SprintManager.Domain.Entities;

namespace Microzone.SprintManager.Domain.Constants;

public static class SeedData
{
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

    public static readonly Role[] RoleSeeds =
    [
        new() { Id = 1, Name = "Admin", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(2870) },
        new() { Id = 2, Name = "Developer", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(3813) },
        new() { Id = 3, Name = "Viewer", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(4124) }
    ];

    public static readonly SystemDefinition[] SystemSeeds =
    [
        new() { Id = 1, Name = "PROMAN - IAR NC", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9415) },
        new() { Id = 2, Name = "PROMAN - PW NC", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9918) },
        new() { Id = 3, Name = "PROMAN - DASHBOARD", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9931) },
        new() { Id = 4, Name = "PROMAN GENERAL", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9939) },
        new() { Id = 5, Name = "PROMAN - ROADS NC", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9946) },
        new() { Id = 6, Name = "DOCSIGN - APP", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9966) },
        new() { Id = 7, Name = "PROMAN - IDENTITY", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9977) },
        new() { Id = 8, Name = "PROMAN - ADMIN", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9989) },
        new() { Id = 9, Name = "SMOKE SIGNAL - APP", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 680, DateTimeKind.Utc).AddTicks(9998) },
        new() { Id = 10, Name = "PROMAN - PORTFOLIO MANAGEMENT (UAMP)", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(14) },
        new() { Id = 11, Name = "CRICKET CLINIC", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(24) },
        new() { Id = 12, Name = "PROMAN - CALL LOGS NC", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(35) },
        new() { Id = 13, Name = "ROADS - APP", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(46) },
        new() { Id = 14, Name = "PROMAN - FILE SYSTEM", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 681, DateTimeKind.Utc).AddTicks(56) }
    ];

    public static readonly WeightCard[] WeightCards =
    [
        new() { Id = 1, WeightValue = 1, TimeScore = 0, TimeLabel = "Super Quick Fix", EstimatedTime = "Half Day", Element = "Lightning", Line = "Blink and it's done.", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(2227) },
        new() { Id = 2, WeightValue = 2, TimeScore = 1, TimeLabel = "Quick Fix", EstimatedTime = "1 day", Element = "Water", Line = "Smooth and steady.", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6384) },
        new() { Id = 3, WeightValue = 4, TimeScore = 2, TimeLabel = "Medium Fix", EstimatedTime = "2 - 3 days", Element = "Plant", Line = "Needs room to grow.", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6409) },
        new() { Id = 4, WeightValue = 8, TimeScore = 3, TimeLabel = "Long Fix", EstimatedTime = "3 - 4 days", Element = "Fire", Line = "This one brings heat.", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6412) },
        new() { Id = 5, WeightValue = 13, TimeScore = 4, TimeLabel = "Super Fix", EstimatedTime = "5 - 12 days", Element = "Rock", Line = "Hard as a rock.", CreatedAtUtc = new DateTime(2026, 7, 4, 10, 29, 4, 678, DateTimeKind.Utc).AddTicks(6415) }
    ];
}
