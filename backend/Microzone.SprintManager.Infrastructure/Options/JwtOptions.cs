namespace Microzone.SprintManager.Infrastructure.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "Microzone.SprintManager";
    public string Audience { get; set; } = "Microzone.SprintManager.Users";
    public string Secret { get; set; } = "ReplaceThisInEnvironmentWithALongSecret123!";
    public int ExpiryMinutes { get; set; } = 480;
}
