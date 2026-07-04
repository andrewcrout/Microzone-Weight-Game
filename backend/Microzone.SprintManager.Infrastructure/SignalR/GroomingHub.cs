using System.Security.Claims;
using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Microzone.SprintManager.Infrastructure.SignalR;

[Authorize]
public sealed class GroomingHub(IGroomingSessionService groomingSessionService, IVotingService votingService) : Hub
{
    public async Task JoinLobby(int sessionId, string displayName)
    {
        var userId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = Context.User!.IsInRole("Admin");
        var lobby = await groomingSessionService.JoinLobbyAsync(sessionId, userId, displayName, isAdmin, Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"session-{sessionId}");
        await Clients.Group($"session-{sessionId}").SendAsync("LobbyUpdated", lobby);
    }

    public async Task SetReady(int sessionId, bool isReady)
    {
        var userId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lobby = await groomingSessionService.SetReadyAsync(sessionId, userId, isReady);
        await Clients.Group($"session-{sessionId}").SendAsync("LobbyUpdated", lobby);

        if (lobby.CanStart)
        {
            await Clients.Group($"session-{sessionId}").SendAsync("CountdownStarted", 3);
        }
    }

    public async Task SubmitVote(VoteRequest request)
    {
        var userId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await votingService.SubmitVoteAsync(request, userId);
        await Clients.Group($"session-{request.SessionId}").SendAsync("ParticipantReady", userId);
    }

    public async Task RevealVotes(int sessionId, int ticketId)
    {
        var reveal = await groomingSessionService.RevealVotesAsync(sessionId, ticketId);
        await Clients.Group($"session-{sessionId}").SendAsync("VotesRevealed", reveal);
    }
}
