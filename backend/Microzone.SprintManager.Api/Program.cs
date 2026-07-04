using Microzone.SprintManager.Application.Interfaces;
using Microzone.SprintManager.Infrastructure.Data;
using Microzone.SprintManager.Infrastructure.Extensions;
using Microzone.SprintManager.Infrastructure.Options;
using Microzone.SprintManager.Infrastructure.Services;
using Microzone.SprintManager.Infrastructure.SignalR;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables(prefix: "SPRINT_MANAGER_");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSprintManagerInfrastructure(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddPolicy("Spa", policy =>
        policy.WithOrigins(builder.Configuration["Cors:SpaUrl"] ?? "http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Microzone Sprint Manager API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SprintManagerDbContext>();
    var passwordHashService = scope.ServiceProvider.GetRequiredService<IPasswordHashService>();
    await DbSeeder.SeedAsync(dbContext, passwordHashService);
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("Spa");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<GroomingHub>("/hubs/grooming");

app.Run();
