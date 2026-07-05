using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Domain.Entities;

namespace Microzone.SprintManager.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
}

public interface IJwtTokenService
{
    AuthResponse Create(User user, IReadOnlyList<string> roles);
}

public interface IPasswordHashService
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string password, string hash);
}

public interface IUserService
{
    Task<IReadOnlyList<UserDto>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(int userId, bool isAdmin, CancellationToken cancellationToken = default);
}

public interface ISprintService
{
    Task<IReadOnlyList<SprintSummaryDto>> GetSprintsAsync(CancellationToken cancellationToken = default);
    Task<SprintDetailDto?> GetSprintAsync(int id, CancellationToken cancellationToken = default);
    Task<SprintSummaryDto> CreateSprintAsync(CreateSprintRequest request, CancellationToken cancellationToken = default);
    Task<SprintSummaryDto?> UpdateSprintAsync(int id, UpdateSprintRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteSprintAsync(int id, CancellationToken cancellationToken = default);
}

public interface ISprintTicketService
{
    Task<PagedResultDto<SprintTicketDto>> GetTicketsAsync(int sprintId, SprintTicketFilterDto filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SprintTicketDto>> GetMyTicketsAsync(string email, CancellationToken cancellationToken = default);
}

public interface ITrelloIntegrationService
{
    Task<IReadOnlyList<TrelloBoardConfigDto>> GetBoardConfigsAsync(CancellationToken cancellationToken = default);
    Task<TrelloBoardConfigDto> SaveBoardConfigAsync(SaveTrelloBoardConfigRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteBoardConfigAsync(int id, CancellationToken cancellationToken = default);
    Task<int> GatherSprintTicketsAsync(GatherSprintTicketsRequest request, CancellationToken cancellationToken = default);
    SprintTicket MapImportedCard(TrelloCardImportDto card, int sprintId, string systemName);
}

public interface IGroomingSessionService
{
    Task<GroomingSessionDto?> GetSessionAsync(int sessionId, CancellationToken cancellationToken = default);
    Task<GroomingSessionDto?> GetActiveSessionAsync(int sprintId, CancellationToken cancellationToken = default);
    Task<GroomingSessionDto> StartSessionAsync(int sprintId, int adminUserId, CancellationToken cancellationToken = default);
    Task<GroomingSessionDto?> BeginSessionAsync(int sessionId, CancellationToken cancellationToken = default);
    Task<GroomingLobbyDto> JoinLobbyAsync(int sessionId, int userId, string displayName, bool isAdmin, string connectionId, CancellationToken cancellationToken = default);
    Task<GroomingLobbyDto> SetReadyAsync(int sessionId, int userId, bool isReady, CancellationToken cancellationToken = default);
    Task<RevealVotesDto> RevealVotesAsync(int sessionId, int ticketId, CancellationToken cancellationToken = default);
    Task AdvanceAsync(int sessionId, int ticketId, int finalWeight, CancellationToken cancellationToken = default);
    Task RemoveTicketAsync(int sessionId, int ticketId, CancellationToken cancellationToken = default);
}

public interface IVotingService
{
    Task SubmitVoteAsync(VoteRequest request, int userId, CancellationToken cancellationToken = default);
    VoteResolutionDto ResolveVotes(IEnumerable<int> votes);
}

public interface IWeightCardService
{
    Task<IReadOnlyList<WeightCardDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<WeightCardDto> SaveAsync(SaveWeightCardRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

public interface ISystemService
{
    Task<IReadOnlyList<SystemDefinitionDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SystemDefinitionDto> SaveAsync(SaveSystemDefinitionRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

public interface IAuditService
{
    Task WriteAsync(int? userId, string action, string detail, CancellationToken cancellationToken = default);
}
