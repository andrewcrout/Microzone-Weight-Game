using System.Security.Claims;
using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Microzone.SprintManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class GroomingSessionsController(IGroomingSessionService groomingSessionService) : ControllerBase
{
    [HttpGet("{sessionId:int}")]
    public async Task<IActionResult> Get(int sessionId, CancellationToken cancellationToken)
    {
        var session = await groomingSessionService.GetSessionAsync(sessionId, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpGet("active/sprint/{sprintId:int}")]
    public async Task<IActionResult> GetActiveForSprint(int sprintId, CancellationToken cancellationToken)
    {
        var session = await groomingSessionService.GetActiveSessionAsync(sprintId, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpPost("start/{sprintId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Start(int sprintId, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await groomingSessionService.StartSessionAsync(sprintId, userId, cancellationToken));
    }

    [HttpPost("{sessionId:int}/begin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Begin(int sessionId, CancellationToken cancellationToken)
    {
        var session = await groomingSessionService.BeginSessionAsync(sessionId, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpPost("{sessionId:int}/remove/{ticketId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveTicket(int sessionId, int ticketId, CancellationToken cancellationToken)
    {
        await groomingSessionService.RemoveTicketAsync(sessionId, ticketId, cancellationToken);
        return Accepted();
    }
}
