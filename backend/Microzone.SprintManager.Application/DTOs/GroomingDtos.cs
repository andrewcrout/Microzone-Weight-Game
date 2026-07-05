namespace Microzone.SprintManager.Application.DTOs;

public sealed record GroomingSessionDto(int Id, int SprintId, string Status, int CurrentTicketIndex, bool VotesRevealed);
public sealed record GroomingLobbyDto(int SessionId, IReadOnlyList<GroomingParticipantDto> Participants, bool CanStart);
public sealed record GroomingParticipantDto(int UserId, string DisplayName, bool IsReady, bool IsAdmin);
public sealed record VoteRequest(int SessionId, int TicketId, int WeightValue);
public sealed record RevealVotesDto(int TicketId, IReadOnlyList<GroomingVoteDto> Votes, bool IsTie, int? MajorityWeight);
public sealed record GroomingVoteDto(int UserId, string DisplayName, int WeightValue);
public sealed record VoteResolutionDto(bool IsTie, int? MajorityWeight, IReadOnlyList<int> DistinctWeights);
public sealed record AdvanceTicketRequest(int SessionId, int TicketId, int FinalWeight);
public sealed record RemoveTicketRequest(int SessionId, int TicketId);
