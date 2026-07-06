using FluentAssertions;
using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Domain.Entities;
using Microzone.SprintManager.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http;
using System.Text;

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
    public async Task GatherSprintTickets_ShouldFailWhenCredentialsAreMissing()
    {
        var fixture = TestFixture.Create();
        fixture.DbContext.Sprints.Add(new Domain.Entities.Sprint { Id = 10, Name = "Sprint 10", Label = "Sprint 10" });
        fixture.DbContext.TrelloBoardConfigs.Add(new Domain.Entities.TrelloBoardConfig { Name = "PROMAN GENERAL", BoardId = "board-1", SystemName = "PROMAN GENERAL" });
        await fixture.DbContext.SaveChangesAsync();

        var service = new TrelloIntegrationService(
            fixture.DbContext,
            fixture.HttpClientFactory.Object,
            Microsoft.Extensions.Options.Options.Create(new Infrastructure.Options.TrelloOptions()));

        var action = async () => await service.GatherSprintTicketsAsync(new GatherSprintTicketsRequest(10, "Sprint 10"));

        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Trello API credentials are missing*");
    }

    [Fact]
    public async Task GatherSprintTickets_ShouldUpdateExistingTicketInPlace()
    {
        var fixture = TestFixture.Create();
        var sprint = new Sprint { Id = 12, Name = "Sprint 12", Label = "Sprint 12" };
        var existingTicket = new SprintTicket
        {
            SprintId = 12,
            TrelloCardId = "card-1",
            BoardId = "board-1",
            ListId = "list-old",
            Title = "Old title",
            Description = "Old description",
            ShortUrl = "https://old",
            SystemName = "PROMAN GENERAL",
            GroomingStatus = "Pending",
            Labels = [new SprintTicketLabel { Name = "Old", Color = "blue" }],
            Comments = [new SprintTicketComment { AuthorName = "Alice", Text = "Old comment" }],
            Assignees = [new SprintTicketAssignee { TrelloMemberId = "member-old", DisplayName = "Old Dev", Email = "old@example.com" }]
        };

        fixture.DbContext.Sprints.Add(sprint);
        fixture.DbContext.SprintTickets.Add(existingTicket);
        fixture.DbContext.TrelloBoardConfigs.Add(new TrelloBoardConfig
        {
            Name = "PROMAN GENERAL",
            BoardId = "board-1",
            BaseUrl = "https://api.trello.com/1",
            IsEnabled = true,
            SystemName = "PROMAN GENERAL"
        });
        await fixture.DbContext.SaveChangesAsync();

        var responseJson = """
            [
              {
                "id": "card-1",
                "idList": "list-new",
                "name": "Updated title",
                "desc": "Updated description",
                "shortUrl": "https://new",
                "labels": [{ "name": "Sprint 12" }, { "name": "Backend" }],
                "actions": [{ "data": { "text": "Fresh comment" }, "memberCreator": { "id": "member-1", "fullName": "Bob", "email": "bob@example.com" } }],
                "members": [{ "id": "member-2", "fullName": "Carol", "email": "carol@example.com" }],
                "due": null,
                "dateLastActivity": "2026-07-06T12:00:00Z"
              }
            ]
            """;

        var handler = new Mock<HttpMessageHandler>();
        handler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
            });

        var httpClient = new HttpClient(handler.Object);
        fixture.HttpClientFactory.Setup(factory => factory.CreateClient("Trello")).Returns(httpClient);

        var service = new TrelloIntegrationService(
            fixture.DbContext,
            fixture.HttpClientFactory.Object,
            Options.Create(new Infrastructure.Options.TrelloOptions
            {
                ApiKey = "test-key",
                Token = "test-token"
            }));

        var imported = await service.GatherSprintTicketsAsync(new GatherSprintTicketsRequest(12, "Sprint 12"));
        var refreshedTicket = await fixture.DbContext.SprintTickets
            .Include(ticket => ticket.Labels)
            .Include(ticket => ticket.Comments)
            .Include(ticket => ticket.Assignees)
            .SingleAsync(ticket => ticket.TrelloCardId == "card-1");

        imported.Should().Be(0);
        refreshedTicket.Id.Should().Be(existingTicket.Id);
        refreshedTicket.Title.Should().Be("Updated title");
        refreshedTicket.Description.Should().Be("Updated description");
        refreshedTicket.ListId.Should().Be("list-new");
        refreshedTicket.Labels.Should().ContainSingle(label => label.Name == "Backend");
        refreshedTicket.Comments.Should().ContainSingle(comment => comment.Text == "Fresh comment");
        refreshedTicket.Assignees.Should().ContainSingle(assignee => assignee.Email == "carol@example.com");
    }
}
