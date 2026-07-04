namespace Microzone.SprintManager.Application.DTOs;

public sealed record DashboardDto(
    string Greeting,
    string? CurrentSprint,
    decimal CompletionPercentage,
    decimal CarryOverRate,
    int RemainingTickets,
    int AssignedTickets,
    int? ActiveGroomingSessionId,
    bool IsAdmin);
