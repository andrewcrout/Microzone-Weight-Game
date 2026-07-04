using FluentAssertions;
using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Infrastructure.Services;

namespace Microzone.SprintManager.Tests;

public sealed class TrelloMappingTests
{
    [Fact]
    public void TrelloIntegrationService_ShouldMapImportedCard()
    {
        var service = new TrelloIntegrationService(null!, null!, Microsoft.Extensions.Options.Options.Create(new Infrastructure.Options.TrelloOptions()));
        var card = new TrelloCardImportDto(
            "card-1",
            "board-1",
            "list-1",
            "Card title",
            "Description",
            "https://trello/card-1",
            ["Sprint 1", "Backend"],
            [new TrelloCommentDto("Alice", "Looks good")],
            [new TrelloMemberDto("member-1", "Bob", "bob@example.com")],
            DateTime.UtcNow,
            DateTime.UtcNow);

        var ticket = service.MapImportedCard(card, 3, "PROMAN GENERAL");

        ticket.SprintId.Should().Be(3);
        ticket.SystemName.Should().Be("PROMAN GENERAL");
        ticket.Labels.Should().HaveCount(2);
        ticket.Comments.Should().ContainSingle();
        ticket.Assignees.Should().ContainSingle(x => x.Email == "bob@example.com");
    }

    [Fact]
    public async Task GatherSprintTickets_ShouldUseMockImport()
    {
        var fixture = TestFixture.Create();
        fixture.DbContext.Sprints.Add(new Domain.Entities.Sprint { Id = 10, Name = "Sprint 10", Label = "Sprint 10" });
        fixture.DbContext.TrelloBoardConfigs.Add(new Domain.Entities.TrelloBoardConfig { Name = "Mock", BoardId = "mock-board", SystemName = "PROMAN GENERAL" });
        await fixture.DbContext.SaveChangesAsync();

        var service = new TrelloIntegrationService(
            fixture.DbContext,
            fixture.HttpClientFactory.Object,
            Microsoft.Extensions.Options.Options.Create(new Infrastructure.Options.TrelloOptions { UseMockData = true }));

        var count = await service.GatherSprintTicketsAsync(new GatherSprintTicketsRequest(10, "Sprint 10", true));

        count.Should().BeGreaterThan(0);
        fixture.DbContext.SprintTickets.Should().NotBeEmpty();
    }
}
