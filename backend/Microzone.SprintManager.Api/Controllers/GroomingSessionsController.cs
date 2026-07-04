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
    [HttpPost("start/{sprintId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Start(int sprintId, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await groomingSessionService.StartSessionAsync(sprintId, userId, cancellationToken));
    }
}
