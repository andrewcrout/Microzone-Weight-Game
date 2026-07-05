using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microzone.SprintManager.Domain.Constants;
using Microzone.SprintManager.Domain.Entities;
using Microzone.SprintManager.Infrastructure.Data;
using Microzone.SprintManager.Infrastructure.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Microzone.SprintManager.Infrastructure.Services;

public sealed class PasswordHashService : IPasswordHashService
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public string HashPassword(User user, string password) => _passwordHasher.HashPassword(user, password);

    public bool VerifyPassword(User user, string password, string hash) =>
        _passwordHasher.VerifyHashedPassword(user, hash, password) != PasswordVerificationResult.Failed;
}

public sealed class JwtTokenService(IOptions<JwtOptions> options) : IJwtTokenService
{
    private readonly JwtOptions _options = options.Value;

    public AuthResponse Create(User user, IReadOnlyList<string> roles)
    {
        var expires = DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("name", user.DisplayName)
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new AuthResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            expires,
            new UserDto(user.Id, user.Email, user.DisplayName, roles));
    }
}

public sealed class AuthService(
    SprintManagerDbContext dbContext,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService) : IAuthService
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);

        if (user is null || !user.IsActive)
        {
            return null;
        }

        if (!passwordHashService.VerifyPassword(user, request.Password, user.PasswordHash))
        {
            return null;
        }

        var roles = user.UserRoles.Select(x => x.Role.Name).ToArray();
        return jwtTokenService.Create(user, roles);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim();
        var existingUser = await dbContext.Users.AnyAsync(x => x.Email == normalizedEmail, cancellationToken);
        if (existingUser)
        {
            throw new InvalidOperationException("A user with that email already exists.");
        }

        var isBootstrapAdmin = !await dbContext.Users.AnyAsync(cancellationToken);
        var roleName = isBootstrapAdmin ? "Admin" : "Developer";

        var user = new User
        {
            Email = normalizedEmail,
            DisplayName = request.DisplayName.Trim()
        };
        user.PasswordHash = passwordHashService.HashPassword(user, request.Password);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        var role = await dbContext.Roles.FirstAsync(x => x.Name == roleName, cancellationToken);
        dbContext.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        await dbContext.SaveChangesAsync(cancellationToken);

        return jwtTokenService.Create(user, [role.Name]);
    }
}

public sealed class UserService(SprintManagerDbContext dbContext) : IUserService
{
    public async Task<IReadOnlyList<UserDto>> GetUsersAsync(CancellationToken cancellationToken = default) =>
        await dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .OrderBy(x => x.DisplayName)
            .Select(x => new UserDto(x.Id, x.Email, x.DisplayName, x.UserRoles.Select(r => r.Role.Name).ToArray()))
            .ToListAsync(cancellationToken);

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        dbContext.Users.Include(x => x.UserRoles).ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
}

public static class DbSeeder
{
    public static async Task SeedAsync(SprintManagerDbContext dbContext, IPasswordHashService passwordHashService)
    {
        await dbContext.Database.MigrateAsync();
    }
}
