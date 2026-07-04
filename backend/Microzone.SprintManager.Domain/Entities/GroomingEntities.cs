namespace Microzone.SprintManager.Domain.Entities;

public sealed class GroomingSession : BaseEntity
{
    public int SprintId { get; set; }
    public Sprint Sprint { get; set; } = null!;
    public string Status { get; set; } = "Lobby";
    public int CurrentTicketIndex { get; set; }
    public bool VotesRevealed { get; set; }
    public ICollection<GroomingParticipant> Participants { get; set; } = new List<GroomingParticipant>();
    public ICollection<GroomingVote> Votes { get; set; } = new List<GroomingVote>();
}

public sealed class GroomingParticipant : BaseEntity
{
    public int GroomingSessionId { get; set; }
    public GroomingSession GroomingSession { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public bool IsReady { get; set; }
    public bool IsAdmin { get; set; }
    public string ConnectionId { get; set; } = string.Empty;
}

public sealed class GroomingVote : BaseEntity
{
    public int GroomingSessionId { get; set; }
    public GroomingSession GroomingSession { get; set; } = null!;
    public int SprintTicketId { get; set; }
    public SprintTicket SprintTicket { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int WeightValue { get; set; }
    public bool IsFinalized { get; set; }
}
