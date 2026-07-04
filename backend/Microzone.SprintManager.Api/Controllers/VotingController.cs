using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Microzone.SprintManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class VotingController(IVotingService votingService, IGroomingSessionService groomingSessionService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SubmitVote([FromBody] VoteRequest request, CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        await votingService.SubmitVoteAsync(request, userId, cancellationToken);
        return Accepted();
    }

    [HttpPost("resolve")]
    [Authorize(Roles = "Admin")]
    public IActionResult Resolve([FromBody] int[] votes) => Ok(votingService.ResolveVotes(votes));

    [HttpPost("advance")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Advance(int sessionId, int ticketId, int finalWeight, CancellationToken cancellationToken)
    {
        await groomingSessionService.AdvanceAsync(sessionId, ticketId, finalWeight, cancellationToken);
        return Accepted();
    }
}
