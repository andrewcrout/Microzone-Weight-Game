using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Microzone.SprintManager.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public sealed class TrelloController(ITrelloIntegrationService trelloIntegrationService) : ControllerBase
{
    [HttpGet("boards")]
    public async Task<IActionResult> GetBoards(CancellationToken cancellationToken) =>
        Ok(await trelloIntegrationService.GetBoardConfigsAsync(cancellationToken));

    [HttpPost("boards")]
    public async Task<IActionResult> SaveBoard([FromBody] SaveTrelloBoardConfigRequest request, CancellationToken cancellationToken) =>
        Ok(await trelloIntegrationService.SaveBoardConfigAsync(request, cancellationToken));

    [HttpPost("gather")]
    public async Task<IActionResult> GatherTickets([FromBody] GatherSprintTicketsRequest request, CancellationToken cancellationToken) =>
        Ok(new { imported = await trelloIntegrationService.GatherSprintTicketsAsync(request, cancellationToken) });
}
