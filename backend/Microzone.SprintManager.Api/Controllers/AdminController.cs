using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Microzone.SprintManager.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public sealed class AdminController(IWeightCardService weightCardService, ISystemService systemService) : ControllerBase
{
    [HttpGet("weight-cards")]
    public async Task<IActionResult> GetWeightCards(CancellationToken cancellationToken) =>
        Ok(await weightCardService.GetAllAsync(cancellationToken));

    [HttpGet("systems")]
    public async Task<IActionResult> GetSystems(CancellationToken cancellationToken) =>
        Ok(await systemService.GetAllAsync(cancellationToken));
}
