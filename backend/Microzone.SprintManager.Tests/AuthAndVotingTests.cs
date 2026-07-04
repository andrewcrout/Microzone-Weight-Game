using FluentAssertions;
using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Domain.Entities;
using Microzone.SprintManager.Infrastructure.Options;
using Microzone.SprintManager.Infrastructure.Services;
using Microsoft.Extensions.Options;

namespace Microzone.SprintManager.Tests;

public sealed class AuthAndVotingTests
{
    [Fact]
    public void PasswordHashService_ShouldHashAndVerifyPassword()
    {
        var service = new PasswordHashService();
        var user = new User { Email = "user@example.com", DisplayName = "User" };

        var hash = service.HashPassword(user, "Secret123!");

        hash.Should().NotBe("Secret123!");
        service.VerifyPassword(user, "Secret123!", hash).Should().BeTrue();
    }

    [Fact]
    public void JwtTokenService_ShouldCreateToken()
    {
        var options = Options.Create(new JwtOptions { Secret = "12345678901234567890123456789012" });
        var service = new JwtTokenService(options);

        var response = service.Create(new User { Id = 5, Email = "user@example.com", DisplayName = "User" }, ["Admin"]);

        response.AccessToken.Should().NotBeNullOrWhiteSpace();
        response.User.Roles.Should().Contain("Admin");
    }

    [Fact]
    public void VotingService_ShouldResolveMajorityVote()
    {
        var service = new VotingService(null!);

        var result = service.ResolveVotes([2, 2, 8, 2, 4]);

        result.IsTie.Should().BeFalse();
        result.MajorityWeight.Should().Be(2);
    }

    [Fact]
    public void VotingService_ShouldDetectTie()
    {
        var service = new VotingService(null!);

        var result = service.ResolveVotes([2, 2, 8, 8]);

        result.IsTie.Should().BeTrue();
        result.MajorityWeight.Should().BeNull();
    }
}
