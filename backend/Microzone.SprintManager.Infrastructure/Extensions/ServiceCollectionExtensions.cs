using System.Text;
using Microzone.SprintManager.Application.Interfaces;
using Microzone.SprintManager.Infrastructure.Data;
using Microzone.SprintManager.Infrastructure.Options;
using Microzone.SprintManager.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Microzone.SprintManager.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSprintManagerInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<TrelloOptions>(configuration.GetSection(TrelloOptions.SectionName));

        var connectionString =
            NormalizeDollarEscapes(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")) ??
            NormalizeDollarEscapes(Environment.GetEnvironmentVariable("PROD_SQL_CONNECTION_STRING")) ??
            BuildContainerDevelopmentConnectionString(configuration) ??
            configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<SprintManagerDbContext>(options =>
            options.UseSqlServer(connectionString));

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
        var key = Encoding.UTF8.GetBytes(jwtOptions.Secret);

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    NameClaimType = "name",
                    RoleClaimType = System.Security.Claims.ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrWhiteSpace(accessToken) && path.StartsWithSegments("/hubs/grooming"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        services.AddAuthorization();
        services.AddSignalR();
        services.AddHttpClient("Trello");

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHashService, PasswordHashService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ISprintService, SprintService>();
        services.AddScoped<ISprintTicketService, SprintTicketService>();
        services.AddScoped<ITrelloIntegrationService, TrelloIntegrationService>();
        services.AddScoped<IGroomingSessionService, GroomingSessionService>();
        services.AddScoped<IVotingService, VotingService>();
        services.AddScoped<IWeightCardService, WeightCardService>();
        services.AddScoped<ISystemService, SystemService>();
        services.AddScoped<IAuditService, AuditService>();

        return services;
    }

    private static string? BuildContainerDevelopmentConnectionString(IConfiguration configuration)
    {
        var sqlPassword = configuration["SQL_SA_PASSWORD"];
        if (string.IsNullOrWhiteSpace(sqlPassword))
        {
            return null;
        }

        return $"Server=sqlserver,1433;Database=MicrozoneSprintManager;User Id=sa;Password={NormalizeDollarEscapes(sqlPassword)};TrustServerCertificate=True";
    }

    private static string? NormalizeDollarEscapes(string? value) =>
        value?.Replace("$$", "$", StringComparison.Ordinal);
}
