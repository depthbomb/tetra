using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

using Tetra.Services;
using Tetra.Data.Entities;
using Tetra.Models.Responses;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("ajax")]
[ApiExplorerSettings(IgnoreApi = true)]
public class AjaxController : BaseController
{
    private readonly TetraContext            _db;
    private readonly IMemoryCache            _cache;
    private readonly ApiKeyService           _apiKey;

    public AjaxController(TetraContext db, IMemoryCache cache, ApiKeyService apiKey)
    {
        _db     = db;
        _cache  = cache;
        _apiKey = apiKey;
    }

    [HttpPost("me")]
    [RequireAuth]
    [RateLimit(4, seconds: 1)]
    public IActionResult CheckUserAuth()
    {
        var user = HttpContext.Items["User"] as User;
        return ApiResult(new
        {
            user.Username,
            user.Avatar,
            user.Disabled,
            user.Admin,
        });
    }
    
    [HttpPost("api-key")]
    [RequireAuth]
    [RateLimit(2, seconds: 1)]
    public async Task<IActionResult> GetUserApiKeyAsync()
    {
        var user   = HttpContext.Items["User"] as User;
        var apiKey = await _db.GetApiKeyByUserIdAsync(user.Id);
        return ApiResult(new
        {
            apiKey           = apiKey.Key,
            canRequestNewKey = apiKey.CanRequestNewKey()
        });
    }
    
    [HttpPost("regenerate-api-key")]
    [RequireAuth]
    [RateLimit(1, seconds: 60)]
    public async Task<IActionResult> RegenerateApiKeyAsync()
    {
        var user   = HttpContext.Items["User"] as User;
        var apiKey = await _db.GetApiKeyByUserIdAsync(user.Id);
        if (apiKey.CanRequestNewKey())
        {
            await _apiKey.RegenerateAsync(user.Id);
            return Ok();
        }

        return Forbid();
    }
    
    [HttpPost("get-user-links")]
    [RequireAuth]
    [RateLimit(2, seconds: 1)]
    public async Task<List<AjaxUserLinksResponse>> GetAuthUserLinksAsync()
    {
        var user = HttpContext.Items["User"] as User;
        var links = await _db.Links
                             .Where(l => l.UserId == user.Id && l.Disabled == false)
                             .Select(l => new AjaxUserLinksResponse
                             {
                                 Shortcode   = l.Shortcode,
                                 Shortlink   = l.Shortlink,
                                 Destination = l.Destination,
                                 DeletionKey = l.DeletionKey,
                                 ExpiresAt   = l.ExpiresAt,
                                 CreatedAt   = l.CreatedAt,
                             })
                             .OrderByDescending(l => l.CreatedAt)
                             .ToListAsync();

        return links;
    }
    
    [HttpPost("get-all-links")]
    [RequireAdmin]
    [RateLimit(2, seconds: 1)]
    public async Task<ActionResult<List<AjaxAllLinksResponse>>> GetAllLinksAsync()
    {
        var links = await _db.Links.Select(l => new AjaxAllLinksResponse
                             {
                                 CreatorIp   = l.CreatorIp,
                                 Shortcode   = l.Shortcode,
                                 Shortlink   = l.Shortlink,
                                 Destination = l.Destination,
                                 DeletionKey = l.DeletionKey,
                                 ExpiresAt   = l.ExpiresAt,
                                 CreatedAt   = l.CreatedAt,
                                 User = new AjaxAllLinksUser
                                 {
                                     Username  = l.User.Username,
                                     Anonymous = l.User.Anonymous,
                                 }
                             })
                             .OrderByDescending(l => l.CreatedAt)
                             .ToListAsync();

        return links;
    }

    [HttpPost("all-stats")]
    [RequireAdmin]
    [RateLimit(2, seconds: 1)]
    public async Task<ActionResult<AjaxAllStatsResponse>> GetAllStatsAsync()
    {
        var linksCount = await _db.GetLinksCountAsync();
        var usersCount = await _db.GetTotalUsersCountAsync();

        return new AjaxAllStatsResponse
        {
            TotalLinks = linksCount,
            TotalUsers = usersCount
        };
    }

    [HttpPost("latest-commit")]
    public ActionResult<AjaxLatestCommitShaResponse> GetLatestCommitHash()
    {
        if (_cache.TryGetValue("latestSha", out string hash))
        {
            return new AjaxLatestCommitShaResponse
            {
                Hash = hash
            };
        }
        
        return Problem();
    }
}
