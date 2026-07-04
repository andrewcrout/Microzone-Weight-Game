using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microzone.SprintManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Microzone.SprintManager.Infrastructure.Services;

public sealed class DashboardService(SprintManagerDbContext dbContext) : IDashboardService
{
    public async Task<DashboardDto> GetDashboardAsync(int userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var sprint = await dbContext.Sprints.Include(x => x.Tickets).FirstOrDefaultAsync(x => x.IsActive, cancellationToken);
        var user = await dbContext.Users.FindAsync([userId], cancellationToken);
        var assignedCount = await dbContext.SprintTicketAssignees.CountAsync(x => x.Email == user!.Email, cancellationToken);
        var activeSession = await dbContext.GroomingSessions.OrderByDescending(x => x.Id).FirstOrDefaultAsync(x => x.Status != "Completed", cancellationToken);

        var totalTickets = sprint?.Tickets.Count ?? 0;
        var completedTickets = sprint?.Tickets.Count(x => x.WeightValue.HasValue) ?? 0;

        return new DashboardDto(
            $"Welcome back, {user!.DisplayName}",
            sprint?.Name,
            totalTickets == 0 ? 0 : Math.Round((decimal)completedTickets / totalTickets * 100, 1),
            0,
            totalTickets - completedTickets,
            assignedCount,
            activeSession?.Id,
            isAdmin);
    }
}

public sealed class SprintService(SprintManagerDbContext dbContext) : ISprintService
{
    public async Task<IReadOnlyList<SprintSummaryDto>> GetSprintsAsync(CancellationToken cancellationToken = default) =>
        await dbContext.Sprints
            .Include(x => x.Tickets)
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.Name)
            .Select(x => new SprintSummaryDto(x.Id, x.Name, x.Label, x.IsActive, x.Tickets.Count))
            .ToListAsync(cancellationToken);

    public async Task<SprintDetailDto?> GetSprintAsync(int id, CancellationToken cancellationToken = default)
    {
        var sprint = await dbContext.Sprints
            .Include(x => x.Tickets).ThenInclude(x => x.Labels)
            .Include(x => x.Tickets).ThenInclude(x => x.Assignees)
            .Include(x => x.Tickets).ThenInclude(x => x.Comments)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return sprint is null
            ? null
            : new SprintDetailDto(
                sprint.Id,
                sprint.Name,
                sprint.Label,
                sprint.Goal,
                sprint.IsActive,
                sprint.Tickets.Select(MapTicket).ToArray());
    }

    internal static SprintTicketDto MapTicket(Domain.Entities.SprintTicket ticket) =>
        new(
            ticket.Id,
            ticket.TrelloCardId,
            ticket.Title,
            ticket.Description,
            ticket.ShortUrl,
            ticket.SystemName,
            ticket.Comments.Count,
            ticket.WeightValue,
            ticket.TimeScore,
            ticket.GroomingStatus,
            ticket.Labels.Select(x => x.Name).ToArray(),
            ticket.Assignees.Select(x => x.DisplayName).ToArray());
}

public sealed class SprintTicketService(SprintManagerDbContext dbContext) : ISprintTicketService
{
    public async Task<PagedResultDto<SprintTicketDto>> GetTicketsAsync(int sprintId, SprintTicketFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = dbContext.SprintTickets
            .Where(x => x.SprintId == sprintId)
            .Include(x => x.Labels)
            .Include(x => x.Assignees)
            .Include(x => x.Comments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            query = query.Where(x => x.Title.Contains(filter.Search) || x.Description.Contains(filter.Search));
        }

        if (!string.IsNullOrWhiteSpace(filter.System))
            query = query.Where(x => x.SystemName == filter.System);
        if (!string.IsNullOrWhiteSpace(filter.Label))
            query = query.Where(x => x.Labels.Any(l => l.Name == filter.Label));
        if (!string.IsNullOrWhiteSpace(filter.Assignee))
            query = query.Where(x => x.Assignees.Any(a => a.DisplayName == filter.Assignee || a.Email == filter.Assignee));
        if (!string.IsNullOrWhiteSpace(filter.GroomingStatus))
            query = query.Where(x => x.GroomingStatus == filter.GroomingStatus);
        if (filter.Weight.HasValue)
            query = query.Where(x => x.WeightValue == filter.Weight.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(x => x.LastActivityAtUtc)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResultDto<SprintTicketDto>(items.Select(SprintService.MapTicket).ToArray(), totalCount, filter.Page, filter.PageSize);
    }

    public async Task<IReadOnlyList<SprintTicketDto>> GetMyTicketsAsync(string email, CancellationToken cancellationToken = default)
    {
        var tickets = await dbContext.SprintTickets
            .Include(x => x.Labels)
            .Include(x => x.Assignees)
            .Include(x => x.Comments)
            .Where(x => x.Assignees.Any(a => a.Email == email))
            .OrderByDescending(x => x.LastActivityAtUtc)
            .ToListAsync(cancellationToken);

        return tickets.Select(SprintService.MapTicket).ToArray();
    }
}

public sealed class WeightCardService(SprintManagerDbContext dbContext) : IWeightCardService
{
    public async Task<IReadOnlyList<WeightCardDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await dbContext.WeightCards.OrderBy(x => x.WeightValue)
            .Select(x => new WeightCardDto(x.Id, x.WeightValue, x.TimeScore, x.TimeLabel, x.EstimatedTime, x.Element, x.Line))
            .ToListAsync(cancellationToken);
}

public sealed class SystemService(SprintManagerDbContext dbContext) : ISystemService
{
    public async Task<IReadOnlyList<SystemDefinitionDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await dbContext.SystemDefinitions.OrderBy(x => x.Name)
            .Select(x => new SystemDefinitionDto(x.Id, x.Name))
            .ToListAsync(cancellationToken);
}

public sealed class AuditService(SprintManagerDbContext dbContext) : IAuditService
{
    public async Task WriteAsync(int? userId, string action, string detail, CancellationToken cancellationToken = default)
    {
        dbContext.AuditLogs.Add(new Domain.Entities.AuditLog { UserId = userId, Action = action, Detail = detail });
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
