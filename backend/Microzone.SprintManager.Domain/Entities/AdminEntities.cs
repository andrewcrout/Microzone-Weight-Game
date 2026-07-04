namespace Microzone.SprintManager.Domain.Entities;

public sealed class WeightCard : BaseEntity
{
    public int WeightValue { get; set; }
    public int TimeScore { get; set; }
    public string TimeLabel { get; set; } = string.Empty;
    public string EstimatedTime { get; set; } = string.Empty;
    public string Element { get; set; } = string.Empty;
    public string Line { get; set; } = string.Empty;
}

public sealed class SystemDefinition : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}

public sealed class AuditLog : BaseEntity
{
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
}
