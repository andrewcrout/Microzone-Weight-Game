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

    public async Task<SprintSummaryDto> CreateSprintAsync(CreateSprintRequest request, CancellationToken cancellationToken = default)
    {
        await SetActiveSprintStateAsync(request.IsActive, cancellationToken);

        var sprint = new Domain.Entities.Sprint
        {
            Name = request.Name.Trim(),
            Label = request.Label.Trim(),
            Goal = string.IsNullOrWhiteSpace(request.Goal) ? null : request.Goal.Trim(),
            IsActive = request.IsActive
        };

        dbContext.Sprints.Add(sprint);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new SprintSummaryDto(sprint.Id, sprint.Name, sprint.Label, sprint.IsActive, 0);
    }

    public async Task<SprintSummaryDto?> UpdateSprintAsync(int id, UpdateSprintRequest request, CancellationToken cancellationToken = default)
    {
        var sprint = await dbContext.Sprints.Include(x => x.Tickets).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (sprint is null)
            return null;

        await SetActiveSprintStateAsync(request.IsActive, cancellationToken, id);

        sprint.Name = request.Name.Trim();
        sprint.Label = request.Label.Trim();
        sprint.Goal = string.IsNullOrWhiteSpace(request.Goal) ? null : request.Goal.Trim();
        sprint.IsActive = request.IsActive;

        await dbContext.SaveChangesAsync(cancellationToken);
        return new SprintSummaryDto(sprint.Id, sprint.Name, sprint.Label, sprint.IsActive, sprint.Tickets.Count);
    }

    public async Task<bool> DeleteSprintAsync(int id, CancellationToken cancellationToken = default)
    {
        var sprint = await dbContext.Sprints.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (sprint is null)
            return false;

        dbContext.Sprints.Remove(sprint);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task SetActiveSprintStateAsync(bool shouldActivate, CancellationToken cancellationToken, int? currentSprintId = null)
    {
        if (!shouldActivate)
            return;

        var activeSprints = await dbContext.Sprints
            .Where(x => x.IsActive && (!currentSprintId.HasValue || x.Id != currentSprintId.Value))
            .ToListAsync(cancellationToken);

        foreach (var activeSprint in activeSprints)
        {
            activeSprint.IsActive = false;
        }
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

    public async Task<WeightCardDto> SaveAsync(SaveWeightCardRequest request, CancellationToken cancellationToken = default)
    {
        var entity = request.Id.HasValue
            ? await dbContext.WeightCards.FirstAsync(x => x.Id == request.Id.Value, cancellationToken)
            : new Domain.Entities.WeightCard();

        entity.WeightValue = request.WeightValue;
        entity.TimeScore = request.TimeScore;
        entity.TimeLabel = request.TimeLabel.Trim();
        entity.EstimatedTime = request.EstimatedTime.Trim();
        entity.Element = request.Element.Trim();
        entity.Line = request.Line.Trim();

        if (!request.Id.HasValue)
        {
            dbContext.WeightCards.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return new WeightCardDto(entity.Id, entity.WeightValue, entity.TimeScore, entity.TimeLabel, entity.EstimatedTime, entity.Element, entity.Line);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.WeightCards.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
            return false;

        dbContext.WeightCards.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public sealed class SystemService(SprintManagerDbContext dbContext) : ISystemService
{
    public async Task<IReadOnlyList<SystemDefinitionDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await dbContext.SystemDefinitions.OrderBy(x => x.Name)
            .Select(x => new SystemDefinitionDto(x.Id, x.Name))
            .ToListAsync(cancellationToken);

    public async Task<SystemDefinitionDto> SaveAsync(SaveSystemDefinitionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = request.Id.HasValue
            ? await dbContext.SystemDefinitions.FirstAsync(x => x.Id == request.Id.Value, cancellationToken)
            : new Domain.Entities.SystemDefinition();

        entity.Name = request.Name.Trim();

        if (!request.Id.HasValue)
        {
            dbContext.SystemDefinitions.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return new SystemDefinitionDto(entity.Id, entity.Name);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.SystemDefinitions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
            return false;

        dbContext.SystemDefinitions.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public sealed class AuditService(SprintManagerDbContext dbContext) : IAuditService
{
    public async Task WriteAsync(int? userId, string action, string detail, CancellationToken cancellationToken = default)
    {
        dbContext.AuditLogs.Add(new Domain.Entities.AuditLog { UserId = userId, Action = action, Detail = detail });
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
