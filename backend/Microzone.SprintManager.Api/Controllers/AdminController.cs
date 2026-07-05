using Microzone.SprintManager.Application.DTOs;
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

    [HttpPost("weight-cards")]
    public async Task<IActionResult> SaveWeightCard([FromBody] SaveWeightCardRequest request, CancellationToken cancellationToken) =>
        Ok(await weightCardService.SaveAsync(request, cancellationToken));

    [HttpDelete("weight-cards/{id:int}")]
    public async Task<IActionResult> DeleteWeightCard(int id, CancellationToken cancellationToken) =>
        await weightCardService.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();

    [HttpPost("systems")]
    public async Task<IActionResult> SaveSystem([FromBody] SaveSystemDefinitionRequest request, CancellationToken cancellationToken) =>
        Ok(await systemService.SaveAsync(request, cancellationToken));

    [HttpDelete("systems/{id:int}")]
    public async Task<IActionResult> DeleteSystem(int id, CancellationToken cancellationToken) =>
        await systemService.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
