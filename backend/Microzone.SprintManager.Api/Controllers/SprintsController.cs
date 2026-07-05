using Microzone.SprintManager.Application.DTOs;
using Microzone.SprintManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Microzone.SprintManager.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class SprintsController(ISprintService sprintService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await sprintService.GetSprintsAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var sprint = await sprintService.GetSprintAsync(id, cancellationToken);
        return sprint is null ? NotFound() : Ok(sprint);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSprintRequest request, CancellationToken cancellationToken) =>
        Ok(await sprintService.CreateSprintAsync(request, cancellationToken));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSprintRequest request, CancellationToken cancellationToken)
    {
        var sprint = await sprintService.UpdateSprintAsync(id, request, cancellationToken);
        return sprint is null ? NotFound() : Ok(sprint);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await sprintService.DeleteSprintAsync(id, cancellationToken) ? NoContent() : NotFound();
}
