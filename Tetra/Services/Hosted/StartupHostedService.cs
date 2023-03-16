using Microsoft.Extensions.Hosting;

using Tetra.Data.Entities;

namespace Tetra.Services.Hosted;

public class StartupHostedService : IHostedService
{
    private readonly ILogger<StartupHostedService> _logger;
    private readonly TetraContext                  _db;

    public StartupHostedService(ILogger<StartupHostedService> logger, TetraContext db)
    {
        _logger = logger;
        _db     = db;
    }
    
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var anonUser = await _db.GetAnonymousUserAsync();
        if (anonUser == null)
        {
            var anonymous = new User
            {
                Username  = "Anonymous",
                Admin     = false,
                Anonymous = true
            };

            await _db.Users.AddAsync(anonymous, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("Created anonymous user");
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken) {}
}
