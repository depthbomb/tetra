using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Tetra.Services.Background;

public class LinkCleanupBackgroundService : BackgroundService
{
    private readonly ILogger<LinkCleanupBackgroundService> _logger;
    private readonly IConfiguration                        _config;
    private readonly TetraContext                          _db;

    public LinkCleanupBackgroundService(ILogger<LinkCleanupBackgroundService> logger, IConfiguration config, TetraContext db)
    {
        _logger = logger;
        _config = config;
        _db     = db;
    }
    
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        int interval = _config.GetValue<int>("BackgroundServices:LinkCleanup:Interval");
        _ = Task.Run(async () =>
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await CleanUpExpiredLinksAsync(stoppingToken);
                await Task.Delay(interval, stoppingToken);
            }
        }, stoppingToken);
        
        return Task.CompletedTask;
    }

    private async Task CleanUpExpiredLinksAsync(CancellationToken ct)
    {
        try
        {
            var now = DateTime.UtcNow;
            var expiredLinks = await _db.Links
                                        .Where(l => l.ExpiresAt != null && l.ExpiresAt <= now)
                                        .ToListAsync(cancellationToken: ct);
            if (expiredLinks.Count > 0)
            {
                _logger.LogDebug("Attempting to delete {Count} expired link(s)", expiredLinks.Count);

                _db.Links.RemoveRange(expiredLinks);

                await _db.SaveChangesAsync(ct);
                
                _logger.LogInformation("Successfully deleted {Count} expired link(s)", expiredLinks.Count);
            }
        }
        catch (Exception ex) when (ex is not TaskCanceledException)
        {
            _logger.LogCritical(ex, "Failed to delete expired links");
        }
    }
}
