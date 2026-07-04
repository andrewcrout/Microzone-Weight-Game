using Microzone.SprintManager.Domain.Constants;
using Microzone.SprintManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Microzone.SprintManager.Infrastructure.Data;

public sealed class SprintManagerDbContext(DbContextOptions<SprintManagerDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Sprint> Sprints => Set<Sprint>();
    public DbSet<SprintTicket> SprintTickets => Set<SprintTicket>();
    public DbSet<SprintTicketLabel> SprintTicketLabels => Set<SprintTicketLabel>();
    public DbSet<SprintTicketComment> SprintTicketComments => Set<SprintTicketComment>();
    public DbSet<SprintTicketAssignee> SprintTicketAssignees => Set<SprintTicketAssignee>();
    public DbSet<TrelloBoardConfig> TrelloBoardConfigs => Set<TrelloBoardConfig>();
    public DbSet<TrelloImportRun> TrelloImportRuns => Set<TrelloImportRun>();
    public DbSet<GroomingSession> GroomingSessions => Set<GroomingSession>();
    public DbSet<GroomingParticipant> GroomingParticipants => Set<GroomingParticipant>();
    public DbSet<GroomingVote> GroomingVotes => Set<GroomingVote>();
    public DbSet<WeightCard> WeightCards => Set<WeightCard>();
    public DbSet<SystemDefinition> SystemDefinitions => Set<SystemDefinition>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(200);
            entity.Property(x => x.DisplayName).HasMaxLength(150);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(x => x.Name).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<UserRole>()
            .HasKey(x => new { x.UserId, x.RoleId });

        modelBuilder.Entity<SprintTicket>(entity =>
        {
            entity.HasIndex(x => new { x.SprintId, x.TrelloCardId }).IsUnique();
            entity.Property(x => x.Title).HasMaxLength(300);
            entity.Property(x => x.SystemName).HasMaxLength(150);
        });

        modelBuilder.Entity<TrelloBoardConfig>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(150);
            entity.Property(x => x.BoardId).HasMaxLength(100);
        });

        modelBuilder.Entity<GroomingParticipant>()
            .HasIndex(x => new { x.GroomingSessionId, x.UserId })
            .IsUnique();

        modelBuilder.Entity<GroomingVote>()
            .HasIndex(x => new { x.GroomingSessionId, x.SprintTicketId, x.UserId })
            .IsUnique();

        modelBuilder.Entity<Role>().HasData(
            SeedData.Roles.Select((name, index) => new Role { Id = index + 1, Name = name, CreatedAtUtc = DateTime.UtcNow }));

        modelBuilder.Entity<SystemDefinition>().HasData(
            SeedData.Systems.Select((name, index) => new SystemDefinition { Id = index + 1, Name = name, CreatedAtUtc = DateTime.UtcNow }));

        modelBuilder.Entity<WeightCard>().HasData(SeedData.WeightCards);
    }
}
