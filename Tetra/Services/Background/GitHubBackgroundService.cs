using Octokit;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Caching.Memory;

namespace Tetra.Services.Background;

public class GitHubBackgroundService : BackgroundService
{
    private readonly IMemoryCache                     _cache;
    private readonly ILogger<GitHubBackgroundService> _logger;
    private readonly GitHubClient                     _client;

    public GitHubBackgroundService(IMemoryCache cache, ILogger<GitHubBackgroundService> logger, IConfiguration config)
    {
        _cache  = cache;
        _logger = logger;
        _client = new GitHubClient(new ProductHeaderValue("Tetra-Web-Backend", "1.0.0.0"))
        {
            Credentials = new Credentials(config.GetValue<string>("GitHub:AccessToken"))
        };
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var commits      = await _client.Repository.Commit.GetAll("depthbomb", "tetra");
            var latestCommit = commits[0];

            _cache.Set("latestSha", latestCommit.Sha);
                
            _logger.LogDebug("Retrieved latest commit hash from GitHub API: {Hash}", latestCommit.Sha);

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
