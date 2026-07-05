using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Microzone.SprintManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class WeightCardsController(IWeightCardService weightCardService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await weightCardService.GetAllAsync(cancellationToken));
}
