namespace Microzone.SprintManager.Application.DTOs;

public sealed record TrelloBoardConfigDto(int Id, string Name, string BoardId, string BaseUrl, bool IsEnabled, string? SystemName);
public sealed record SaveTrelloBoardConfigRequest(string Name, string BoardId, string BaseUrl, bool IsEnabled, string? SystemName);
public sealed record GatherSprintTicketsRequest(int SprintId, string Label, bool UseMockData);
public sealed record TrelloCardImportDto(
    string CardId,
    string BoardId,
    string? ListId,
    string Title,
    string Description,
    string ShortUrl,
    IReadOnlyList<string> Labels,
    IReadOnlyList<TrelloCommentDto> Comments,
    IReadOnlyList<TrelloMemberDto> Members,
    DateTime? DueDateUtc,
    DateTime LastActivityAtUtc);
public sealed record TrelloCommentDto(string AuthorName, string Text);
public sealed record TrelloMemberDto(string MemberId, string DisplayName, string? Email);
