namespace Microzone.SprintManager.Application.DTOs;

public sealed record CreateSprintRequest(string Name, string Label, string? Goal, bool IsActive);
public sealed record UpdateSprintRequest(string Name, string Label, string? Goal, bool IsActive);
public sealed record SprintSummaryDto(int Id, string Name, string Label, bool IsActive, int TicketCount);
public sealed record SprintDetailDto(int Id, string Name, string Label, string? Goal, bool IsActive, IReadOnlyList<SprintTicketDto> Tickets);
public sealed record SprintTicketDto(
    int Id,
    string TrelloCardId,
    string Title,
    string Description,
    string ShortUrl,
    string SystemName,
    int CommentCount,
    int? WeightValue,
    int? TimeScore,
    string GroomingStatus,
    IReadOnlyList<string> Labels,
    IReadOnlyList<string> Assignees,
    IReadOnlyList<string> Comments);
public sealed record SprintTicketFilterDto(
    string? Search,
    string? System,
    string? Label,
    string? Assignee,
    string? GroomingStatus,
    int? Weight,
    int Page = 1,
    int PageSize = 20);
public sealed record PagedResultDto<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
