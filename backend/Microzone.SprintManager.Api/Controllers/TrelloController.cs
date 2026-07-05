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
    public async Task<IActionResult> SaveBoard([FromBody] SaveTrelloBoardConfigRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await trelloIntegrationService.SaveBoardConfigAsync(request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpDelete("boards/{id:int}")]
    public async Task<IActionResult> DeleteBoard(int id, CancellationToken cancellationToken) =>
        await trelloIntegrationService.DeleteBoardConfigAsync(id, cancellationToken) ? NoContent() : NotFound();

    [HttpPost("gather")]
    public async Task<IActionResult> GatherTickets([FromBody] GatherSprintTicketsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(new { imported = await trelloIntegrationService.GatherSprintTicketsAsync(request, cancellationToken) });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
