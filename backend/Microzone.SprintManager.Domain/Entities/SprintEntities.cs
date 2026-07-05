namespace Microzone.SprintManager.Domain.Entities;

public sealed class Sprint : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public string Label { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<SprintTicket> Tickets { get; set; } = new List<SprintTicket>();
}

public sealed class SprintTicket : BaseEntity
{
    public const string DefaultWorkStatus = "Not Started";

    public int SprintId { get; set; }
    public Sprint Sprint { get; set; } = null!;
    public string TrelloCardId { get; set; } = string.Empty;
    public string BoardId { get; set; } = string.Empty;
    public string? ListId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortUrl { get; set; } = string.Empty;
    public string SystemName { get; set; } = string.Empty;
    public int? WeightValue { get; set; }
    public int? TimeScore { get; set; }
    public string GroomingStatus { get; set; } = "Pending";
    public string WorkStatus { get; set; } = DefaultWorkStatus;
    public DateTime? DueDateUtc { get; set; }
    public DateTime LastActivityAtUtc { get; set; }
    public ICollection<SprintTicketLabel> Labels { get; set; } = new List<SprintTicketLabel>();
    public ICollection<SprintTicketComment> Comments { get; set; } = new List<SprintTicketComment>();
    public ICollection<SprintTicketAssignee> Assignees { get; set; } = new List<SprintTicketAssignee>();
}

public sealed class SprintTicketLabel : BaseEntity
{
    public int SprintTicketId { get; set; }
    public SprintTicket SprintTicket { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public sealed class SprintTicketComment : BaseEntity
{
    public int SprintTicketId { get; set; }
    public SprintTicket SprintTicket { get; set; } = null!;
    public string AuthorName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}

public sealed class SprintTicketAssignee : BaseEntity
{
    public int SprintTicketId { get; set; }
    public SprintTicket SprintTicket { get; set; } = null!;
    public string TrelloMemberId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
}

public sealed class TrelloBoardConfig : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string BoardId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.trello.com/1";
    public bool IsEnabled { get; set; } = true;
    public string? SystemName { get; set; }
}

public sealed class TrelloImportRun : BaseEntity
{
    public int SprintId { get; set; }
    public Sprint Sprint { get; set; } = null!;
    public int ImportedTicketCount { get; set; }
    public string Source { get; set; } = string.Empty;
    public bool UsedMockData { get; set; }
}
