using System.Security.Claims;
using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Microzone.SprintManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class SprintTicketsController(ISprintTicketService sprintTicketService) : ControllerBase
{
    [HttpGet("sprint/{sprintId:int}")]
    public async Task<IActionResult> GetTickets(int sprintId, [FromQuery] SprintTicketFilterDto filter, CancellationToken cancellationToken) =>
        Ok(await sprintTicketService.GetTicketsAsync(sprintId, filter, cancellationToken));

    [HttpGet("my")]
    public async Task<IActionResult> GetMyTickets(CancellationToken cancellationToken) =>
        Ok(await sprintTicketService.GetMyTicketsAsync(User.FindFirstValue(ClaimTypes.Email)!, cancellationToken));

    [HttpPost("{ticketId:int}/assign-self")]
    public async Task<IActionResult> AssignSelf(int ticketId, CancellationToken cancellationToken)
    {
        var ticket = await sprintTicketService.AssignToEmailAsync(ticketId, User.FindFirstValue(ClaimTypes.Email)!, cancellationToken);
        return ticket is null ? NotFound() : Ok(ticket);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{ticketId:int}/assign-user")]
    public async Task<IActionResult> AssignUser(int ticketId, [FromBody] AssignSprintTicketRequest request, CancellationToken cancellationToken)
    {
        var ticket = await sprintTicketService.AssignToUserAsync(ticketId, request.UserId, cancellationToken);
        return ticket is null ? NotFound() : Ok(ticket);
    }

    [HttpPost("{ticketId:int}/work-status")]
    public async Task<IActionResult> UpdateWorkStatus(int ticketId, [FromBody] UpdateSprintTicketStatusRequest request, CancellationToken cancellationToken)
    {
        var ticket = await sprintTicketService.UpdateWorkStatusAsync(
            ticketId,
            request.WorkStatus,
            User.FindFirstValue(ClaimTypes.Email)!,
            User.IsInRole("Admin"),
            cancellationToken);
        return ticket is null ? NotFound() : Ok(ticket);
    }
}
