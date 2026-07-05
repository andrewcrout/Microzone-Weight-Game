namespace Microzone.SprintManager.Application.DTOs;

public sealed record LoginRequest(string Email, string Password);
public sealed record RegisterRequest(string Email, string DisplayName, string Password);
public sealed record AuthResponse(string AccessToken, DateTime ExpiresAtUtc, UserDto User);
public sealed record UserDto(int Id, string Email, string DisplayName, IReadOnlyList<string> Roles);
