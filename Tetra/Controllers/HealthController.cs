using Microsoft.AspNetCore.Mvc;

using Tetra.Services;

namespace Tetra.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class HealthController : BaseController
{
    private readonly HealthService _health;

    public HealthController(HealthService health)
    {
        _health = health;
    }
    
    [HttpGet("/health")]
    public async Task<IActionResult> ReportHealthAsync()
    {
        var databaseUp = await _health.IsDatabaseConnectableAsync();
        if (databaseUp)
        {
            return new StatusCodeResult(204);
        }
        
        return new StatusCodeResult(503);
    }
}
