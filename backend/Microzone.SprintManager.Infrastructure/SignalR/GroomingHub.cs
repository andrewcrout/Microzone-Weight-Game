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
    }

    public async Task LeaveLobby(int sessionId)
    {
        var userId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lobby = await groomingSessionService.LeaveLobbyAsync(sessionId, userId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session-{sessionId}");
        await Clients.Group($"session-{sessionId}").SendAsync("LobbyUpdated", lobby);
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
        await Clients.Group($"session-{sessionId}").SendAsync("CountdownStarted", 3);
    }

    public async Task StartSession(int sessionId)
    {
        if (!Context.User!.IsInRole("Admin"))
            throw new HubException("Only admins can start a grooming session.");

        var session = await groomingSessionService.BeginSessionAsync(sessionId)
            ?? throw new HubException("Grooming session not found.");

        await Clients.Group($"session-{sessionId}").SendAsync("SessionUpdated", session);
        await Clients.Group($"session-{sessionId}").SendAsync("SessionStarted", session);
    }

    public async Task AdvanceTicket(int sessionId, int ticketId, int finalWeight)
    {
        if (!Context.User!.IsInRole("Admin"))
            throw new HubException("Only admins can confirm ticket weights.");

        await groomingSessionService.AdvanceAsync(sessionId, ticketId, finalWeight);
        var session = await groomingSessionService.GetSessionAsync(sessionId)
            ?? throw new HubException("Grooming session not found.");

        await Clients.Group($"session-{sessionId}").SendAsync("SessionUpdated", session);
    }

    public async Task RemoveTicket(int sessionId, int ticketId)
    {
        if (!Context.User!.IsInRole("Admin"))
            throw new HubException("Only admins can remove tickets.");

        await groomingSessionService.RemoveTicketAsync(sessionId, ticketId);
        var session = await groomingSessionService.GetSessionAsync(sessionId)
            ?? throw new HubException("Grooming session not found.");

        await Clients.Group($"session-{sessionId}").SendAsync("SessionUpdated", session);
    }
}
