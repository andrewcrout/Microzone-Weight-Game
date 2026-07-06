using System.Net;
using System.Net.Http.Json;
using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microzone.SprintManager.Domain.Entities;
using Microzone.SprintManager.Infrastructure.Data;
using Microzone.SprintManager.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Microzone.SprintManager.Infrastructure.Services;

public sealed class TrelloIntegrationService(
    SprintManagerDbContext dbContext,
    IHttpClientFactory httpClientFactory,
    IOptions<TrelloOptions> options) : ITrelloIntegrationService
{
    private const string DefaultTrelloApiBaseUrl = "https://api.trello.com/1";
    private readonly TrelloOptions _options = options.Value;

    public async Task<IReadOnlyList<TrelloBoardConfigDto>> GetBoardConfigsAsync(CancellationToken cancellationToken = default) =>
        await dbContext.TrelloBoardConfigs.OrderBy(x => x.Name)
            .Select(x => new TrelloBoardConfigDto(x.Id, x.Name, x.BoardId, x.BaseUrl, x.IsEnabled, x.SystemName))
            .ToListAsync(cancellationToken);

    public async Task<TrelloBoardConfigDto> SaveBoardConfigAsync(SaveTrelloBoardConfigRequest request, CancellationToken cancellationToken = default)
    {
        var boardName = request.Name.Trim();
        var requestedSystemName = string.IsNullOrWhiteSpace(request.SystemName)
            ? boardName
            : request.SystemName.Trim();

        var matchedSystem = await dbContext.SystemDefinitions
            .Where(x => x.Name == requestedSystemName || x.Name == boardName)
            .OrderByDescending(x => x.Name == boardName)
            .FirstOrDefaultAsync(cancellationToken);

        if (matchedSystem is null)
            throw new InvalidOperationException($"No system definition matches board name '{boardName}'. Add the system definition first or use the same board name.");

        var entity = request.Id.HasValue
            ? await dbContext.TrelloBoardConfigs.FirstOrDefaultAsync(x => x.Id == request.Id.Value, cancellationToken)
            : null;

        entity ??= new TrelloBoardConfig();
        entity.Name = boardName;
        entity.BoardId = request.BoardId.Trim();
        entity.BaseUrl = request.BaseUrl.Trim();
        entity.IsEnabled = request.IsEnabled;
        entity.SystemName = matchedSystem.Name;

        if (!request.Id.HasValue)
            dbContext.TrelloBoardConfigs.Add(entity);

        await dbContext.SaveChangesAsync(cancellationToken);
        return new TrelloBoardConfigDto(entity.Id, entity.Name, entity.BoardId, entity.BaseUrl, entity.IsEnabled, entity.SystemName);
    }

    public async Task<bool> DeleteBoardConfigAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.TrelloBoardConfigs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
            return false;

        dbContext.TrelloBoardConfigs.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<int> GatherSprintTicketsAsync(GatherSprintTicketsRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey) || string.IsNullOrWhiteSpace(_options.Token))
            throw new InvalidOperationException("Trello API credentials are missing. Configure TRELLO_API_KEY and TRELLO_TOKEN before importing sprint tickets.");

        var sprint = await dbContext.Sprints
            .Include(x => x.Tickets).ThenInclude(x => x.Labels)
            .Include(x => x.Tickets).ThenInclude(x => x.Comments)
            .Include(x => x.Tickets).ThenInclude(x => x.Assignees)
            .FirstAsync(x => x.Id == request.SprintId, cancellationToken);
        sprint.Label = request.Label;

        var boardConfigs = await dbContext.TrelloBoardConfigs.Where(x => x.IsEnabled).ToListAsync(cancellationToken);
        if (boardConfigs.Count == 0)
            throw new InvalidOperationException("No enabled Trello boards are configured for import.");

        var importResult = await GetLiveCardsAsync(boardConfigs, request.Label, cancellationToken);
        if (importResult.Cards.Count == 0 && importResult.Failures.Count > 0)
            throw new InvalidOperationException($"Unable to import from any enabled Trello board. {string.Join(" ", importResult.Failures)}");

        var cards = importResult.Cards;

        var insertedCount = 0;
        var boardLookup = boardConfigs
            .GroupBy(x => x.BoardId)
            .ToDictionary(group => group.Key, group => group.First());
        var existingByTrelloCardId = sprint.Tickets
            .GroupBy(ticket => ticket.TrelloCardId)
            .ToDictionary(group => group.Key, group => group.First());
        var importedCardIds = new HashSet<string>(StringComparer.Ordinal);

        foreach (var card in cards)
        {
            var matchedConfig = boardLookup.TryGetValue(card.BoardId, out var config)
                ? config
                : null;

            if (matchedConfig is null)
                continue;

            importedCardIds.Add(card.CardId);

            if (existingByTrelloCardId.TryGetValue(card.CardId, out var existingTicket))
            {
                UpdateImportedCard(existingTicket, card, matchedConfig.SystemName ?? "PROMAN GENERAL");
                continue;
            }

            dbContext.SprintTickets.Add(MapImportedCard(card, sprint.Id, matchedConfig.SystemName ?? "PROMAN GENERAL"));
            insertedCount++;
        }

        var obsoleteTicketIds = sprint.Tickets
            .Where(ticket => !importedCardIds.Contains(ticket.TrelloCardId))
            .Select(ticket => ticket.Id)
            .ToArray();

        if (obsoleteTicketIds.Length > 0)
        {
            var ticketIdsWithVotes = await dbContext.GroomingVotes
                .Where(vote => obsoleteTicketIds.Contains(vote.SprintTicketId))
                .Select(vote => vote.SprintTicketId)
                .Distinct()
                .ToListAsync(cancellationToken);

            foreach (var obsoleteTicket in sprint.Tickets
                         .Where(ticket => obsoleteTicketIds.Contains(ticket.Id) && !ticketIdsWithVotes.Contains(ticket.Id))
                         .ToList())
            {
                dbContext.SprintTickets.Remove(obsoleteTicket);
            }
        }

        dbContext.TrelloImportRuns.Add(new TrelloImportRun
        {
            SprintId = sprint.Id,
            ImportedTicketCount = insertedCount,
            Source = "Trello",
            UsedMockData = false
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        return insertedCount;
    }

    public SprintTicket MapImportedCard(TrelloCardImportDto card, int sprintId, string systemName)
    {
        var ticket = new SprintTicket
        {
            SprintId = sprintId,
            TrelloCardId = card.CardId,
            BoardId = card.BoardId,
            ListId = card.ListId,
            Title = card.Title,
            Description = card.Description,
            ShortUrl = card.ShortUrl,
            SystemName = systemName,
            DueDateUtc = card.DueDateUtc,
            LastActivityAtUtc = card.LastActivityAtUtc,
            GroomingStatus = "Pending"
        };

        ticket.Labels = card.Labels.Select(label => new SprintTicketLabel { Name = label, Color = "blue" }).ToList();
        ticket.Comments = card.Comments.Select(comment => new SprintTicketComment { AuthorName = comment.AuthorName, Text = comment.Text }).ToList();
        ticket.Assignees = card.Members.Select(member => new SprintTicketAssignee
        {
            TrelloMemberId = member.MemberId,
            DisplayName = member.DisplayName,
            Email = member.Email
        }).ToList();

        return ticket;
    }

    private static void UpdateImportedCard(SprintTicket ticket, TrelloCardImportDto card, string systemName)
    {
        ticket.BoardId = card.BoardId;
        ticket.ListId = card.ListId;
        ticket.Title = card.Title;
        ticket.Description = card.Description;
        ticket.ShortUrl = card.ShortUrl;
        ticket.SystemName = systemName;
        ticket.DueDateUtc = card.DueDateUtc;
        ticket.LastActivityAtUtc = card.LastActivityAtUtc;

        ticket.Labels.Clear();
        foreach (var label in card.Labels)
        {
            ticket.Labels.Add(new SprintTicketLabel { Name = label, Color = "blue" });
        }

        ticket.Comments.Clear();
        foreach (var comment in card.Comments)
        {
            ticket.Comments.Add(new SprintTicketComment { AuthorName = comment.AuthorName, Text = comment.Text });
        }

        ticket.Assignees.Clear();
        foreach (var member in card.Members)
        {
            ticket.Assignees.Add(new SprintTicketAssignee
            {
                TrelloMemberId = member.MemberId,
                DisplayName = member.DisplayName,
                Email = member.Email
            });
        }
    }

    private async Task<TrelloCardImportResult> GetLiveCardsAsync(IReadOnlyList<TrelloBoardConfig> boardConfigs, string label, CancellationToken cancellationToken)
    {
        var httpClient = httpClientFactory.CreateClient("Trello");
        var result = new List<TrelloCardImportDto>();
        var failures = new List<string>();

        foreach (var board in boardConfigs)
        {
            var url = BuildBoardCardsUrl(board);
            using var response = await httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                if (ShouldSkipBoard(response.StatusCode))
                {
                    failures.Add($"Board '{board.Name}' ({board.BoardId}) returned {(int)response.StatusCode} {response.ReasonPhrase} and was skipped.");
                    continue;
                }

                response.EnsureSuccessStatusCode();
            }

            var cards = await response.Content.ReadFromJsonAsync<List<TrelloApiCard>>(cancellationToken: cancellationToken) ?? [];

            result.AddRange(cards
                .Where(card => card.Labels.Any(x => string.Equals(x.Name, label, StringComparison.OrdinalIgnoreCase)))
                .Select(card => new TrelloCardImportDto(
                    card.Id,
                    board.BoardId,
                    card.IdList,
                    card.Name,
                    card.Desc,
                    card.ShortUrl,
                    card.Labels.Select(x => x.Name).ToArray(),
                    card.Actions.Select(x => new TrelloCommentDto(x.MemberCreator?.FullName ?? "Unknown", x.Data?.Text ?? string.Empty)).ToArray(),
                    card.Members.Select(x => new TrelloMemberDto(x.Id, x.FullName, x.Email)).ToArray(),
                    card.Due,
                    card.DateLastActivity)));
        }

        return new TrelloCardImportResult(result, failures);
    }

    private static bool ShouldSkipBoard(HttpStatusCode statusCode) =>
        statusCode is HttpStatusCode.Forbidden or HttpStatusCode.NotFound or HttpStatusCode.Unauthorized;

    private string BuildBoardCardsUrl(TrelloBoardConfig board)
    {
        var baseUrl = NormalizeApiBaseUrl(board.BaseUrl);
        return $"{baseUrl}/boards/{Uri.EscapeDataString(board.BoardId)}/cards?key={Uri.EscapeDataString(_options.ApiKey)}&token={Uri.EscapeDataString(_options.Token)}&members=true&actions=commentCard";
    }

    private static string NormalizeApiBaseUrl(string? configuredBaseUrl)
    {
        if (string.IsNullOrWhiteSpace(configuredBaseUrl))
            return DefaultTrelloApiBaseUrl;

        var trimmed = configuredBaseUrl.Trim().TrimEnd('/');
        return trimmed.Contains("/1", StringComparison.Ordinal)
            ? trimmed
            : DefaultTrelloApiBaseUrl;
    }

    private sealed record TrelloCardImportResult(List<TrelloCardImportDto> Cards, List<string> Failures);
    private sealed record TrelloApiCard(string Id, string IdList, string Name, string Desc, string ShortUrl, List<TrelloApiLabel> Labels, List<TrelloApiAction> Actions, List<TrelloApiMember> Members, DateTime? Due, DateTime DateLastActivity);
    private sealed record TrelloApiLabel(string Name);
    private sealed record TrelloApiAction(TrelloApiActionData? Data, TrelloApiMember? MemberCreator);
    private sealed record TrelloApiActionData(string? Text);
    private sealed record TrelloApiMember(string Id, string FullName, string? Email);
}

public sealed class VotingService(SprintManagerDbContext dbContext) : IVotingService
{
    public async Task SubmitVoteAsync(VoteRequest request, int userId, CancellationToken cancellationToken = default)
    {
        var existing = await dbContext.GroomingVotes
            .FirstOrDefaultAsync(x => x.GroomingSessionId == request.SessionId && x.SprintTicketId == request.TicketId && x.UserId == userId, cancellationToken);

        if (existing is null)
        {
            dbContext.GroomingVotes.Add(new GroomingVote
            {
                GroomingSessionId = request.SessionId,
                SprintTicketId = request.TicketId,
                UserId = userId,
                WeightValue = request.WeightValue
            });
        }
        else
        {
            existing.WeightValue = request.WeightValue;
            existing.UpdatedAtUtc = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public VoteResolutionDto ResolveVotes(IEnumerable<int> votes)
    {
        var grouped = votes.GroupBy(x => x).OrderByDescending(x => x.Count()).ThenBy(x => x.Key).ToList();
        if (grouped.Count == 0)
            return new VoteResolutionDto(false, null, []);

        var tie = grouped.Count > 1 && grouped[0].Count() == grouped[1].Count();
        return new VoteResolutionDto(tie, tie ? null : grouped[0].Key, grouped.Select(x => x.Key).ToArray());
    }
}

public sealed class GroomingSessionService(
    SprintManagerDbContext dbContext,
    IVotingService votingService) : IGroomingSessionService
{
    public async Task<GroomingSessionDto?> GetSessionAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.GroomingSessions.FirstOrDefaultAsync(x => x.Id == sessionId, cancellationToken);
        return session is null ? null : MapSession(session);
    }

    public async Task<GroomingSessionDto?> GetActiveSessionAsync(int sprintId, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.GroomingSessions
            .Where(x => x.SprintId == sprintId && x.Status != "Completed")
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return session is null ? null : MapSession(session);
    }

    public async Task<GroomingSessionDto> StartSessionAsync(int sprintId, int adminUserId, CancellationToken cancellationToken = default)
    {
        var existingSession = await dbContext.GroomingSessions
            .Where(x => x.SprintId == sprintId && x.Status != "Completed")
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingSession is not null)
            return MapSession(existingSession);

        var session = new GroomingSession { SprintId = sprintId, Status = "Lobby", CurrentTicketIndex = 0 };
        dbContext.GroomingSessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapSession(session);
    }

    public async Task<GroomingSessionDto?> BeginSessionAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.GroomingSessions.FirstOrDefaultAsync(x => x.Id == sessionId, cancellationToken);
        if (session is null)
            return null;

        session.Status = "InProgress";
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapSession(session);
    }

    public async Task<GroomingLobbyDto> JoinLobbyAsync(int sessionId, int userId, string displayName, bool isAdmin, string connectionId, CancellationToken cancellationToken = default)
    {
        var participant = await dbContext.GroomingParticipants.FirstOrDefaultAsync(x => x.GroomingSessionId == sessionId && x.UserId == userId, cancellationToken);
        if (participant is null)
        {
            dbContext.GroomingParticipants.Add(new GroomingParticipant
            {
                GroomingSessionId = sessionId,
                UserId = userId,
                ConnectionId = connectionId,
                IsAdmin = isAdmin
            });
        }
        else
        {
            participant.ConnectionId = connectionId;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return await BuildLobbyAsync(sessionId, cancellationToken);
    }

    public async Task<GroomingLobbyDto> SetReadyAsync(int sessionId, int userId, bool isReady, CancellationToken cancellationToken = default)
    {
        var participant = await dbContext.GroomingParticipants.FirstAsync(x => x.GroomingSessionId == sessionId && x.UserId == userId, cancellationToken);
        participant.IsReady = isReady;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await BuildLobbyAsync(sessionId, cancellationToken);
    }

    public async Task<GroomingLobbyDto> LeaveLobbyAsync(int sessionId, int userId, CancellationToken cancellationToken = default)
    {
        var participant = await dbContext.GroomingParticipants
            .FirstOrDefaultAsync(x => x.GroomingSessionId == sessionId && x.UserId == userId, cancellationToken);

        if (participant is not null)
        {
            dbContext.GroomingParticipants.Remove(participant);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return await BuildLobbyAsync(sessionId, cancellationToken);
    }

    public async Task<RevealVotesDto> RevealVotesAsync(int sessionId, int ticketId, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.GroomingSessions.FirstAsync(x => x.Id == sessionId, cancellationToken);
        session.VotesRevealed = true;

        var votes = await dbContext.GroomingVotes
            .Where(x => x.GroomingSessionId == sessionId && x.SprintTicketId == ticketId)
            .Include(x => x.User)
            .ToListAsync(cancellationToken);

        var resolution = votingService.ResolveVotes(votes.Select(x => x.WeightValue));
        await dbContext.SaveChangesAsync(cancellationToken);

        return new RevealVotesDto(
            ticketId,
            votes.Select(x => new GroomingVoteDto(x.UserId, x.User.DisplayName, x.WeightValue)).ToArray(),
            resolution.IsTie,
            resolution.MajorityWeight);
    }

    public async Task AdvanceAsync(int sessionId, int ticketId, int finalWeight, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.GroomingSessions.FirstAsync(x => x.Id == sessionId, cancellationToken);
        var ticket = await dbContext.SprintTickets.FirstAsync(x => x.Id == ticketId, cancellationToken);
        var weightCard = await dbContext.WeightCards.FirstAsync(x => x.WeightValue == finalWeight, cancellationToken);

        ticket.WeightValue = finalWeight;
        ticket.TimeScore = weightCard.TimeScore;
        ticket.GroomingStatus = "Groomed";
        session.CurrentTicketIndex += 1;
        session.VotesRevealed = false;

        await FinalizeSessionStateAsync(session, ticket.SprintId, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveTicketAsync(int sessionId, int ticketId, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.GroomingSessions.FirstAsync(x => x.Id == sessionId, cancellationToken);
        var ticket = await dbContext.SprintTickets.FirstAsync(x => x.Id == ticketId, cancellationToken);

        ticket.GroomingStatus = "Removed";
        ticket.WeightValue = null;
        ticket.TimeScore = null;
        session.CurrentTicketIndex += 1;
        session.VotesRevealed = false;

        await FinalizeSessionStateAsync(session, ticket.SprintId, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<GroomingLobbyDto> BuildLobbyAsync(int sessionId, CancellationToken cancellationToken)
    {
        var users = await dbContext.GroomingParticipants
            .Where(x => x.GroomingSessionId == sessionId)
            .Join(dbContext.Users, participant => participant.UserId, user => user.Id, (participant, user) => new GroomingParticipantDto(user.Id, user.DisplayName, participant.IsReady, participant.IsAdmin))
            .ToListAsync(cancellationToken);

        return new GroomingLobbyDto(sessionId, users, users.Count > 0 && users.Where(x => !x.IsAdmin).All(x => x.IsReady));
    }

    private async Task FinalizeSessionStateAsync(GroomingSession session, int sprintId, CancellationToken cancellationToken)
    {
        var remaining = await dbContext.SprintTickets.CountAsync(
            x => x.SprintId == sprintId && x.GroomingStatus == "Pending",
            cancellationToken);

        if (remaining == 0)
            session.Status = "Completed";
    }

    private static GroomingSessionDto MapSession(GroomingSession session) =>
        new(session.Id, session.SprintId, session.Status, session.CurrentTicketIndex, session.VotesRevealed);
}
