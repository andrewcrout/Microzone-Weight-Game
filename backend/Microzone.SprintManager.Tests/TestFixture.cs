using Microzone.SprintManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Microzone.SprintManager.Tests;

internal sealed class TestFixture
{
    public SprintManagerDbContext DbContext { get; }
    public Mock<IHttpClientFactory> HttpClientFactory { get; } = new();

    private TestFixture(SprintManagerDbContext dbContext)
    {
        DbContext = dbContext;
    }

    public static TestFixture Create()
    {
        var options = new DbContextOptionsBuilder<SprintManagerDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new TestFixture(new SprintManagerDbContext(options));
    }
}
