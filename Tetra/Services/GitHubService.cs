using Octokit;
using Microsoft.Extensions.Caching.Memory;

namespace Tetra.Services;

public class GitHubService
{
    private readonly IMemoryCache _cache;
    private readonly GitHubClient _client;

    public GitHubService(IMemoryCache cache)
    {
        _cache = cache;
        _client = new GitHubClient(new ProductHeaderValue("Tetra-Web-Backend", "1.0.0.0"))
        {
            Credentials = new Credentials("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")
        };
    }

    public async Task<string> GetLatestCommitShaAsync()
    {
        if (_cache.TryGetValue("latestSha", out string latestSha))
        {
            return latestSha;
        }
        
        var commits      = await _client.Repository.Commit.GetAll("depthbomb", "tetra");
        var latestCommit = commits[0];

        latestSha = latestCommit.Sha;

        _cache.Set("latestSha", latestSha, TimeSpan.FromMinutes(1));

        return latestSha;
    }
}
