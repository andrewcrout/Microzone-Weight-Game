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
}
