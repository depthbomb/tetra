using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

using Tetra.Services;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("ajax")]
[ApiExplorerSettings(IgnoreApi = true)]
public class AjaxController : BaseController
{
    private readonly ILogger<AjaxController> _logger;
    private readonly TetraContext            _db;
    private readonly IMemoryCache            _cache;
    private readonly ApiKeyService           _apiKey;

    public AjaxController(ILogger<AjaxController> logger, TetraContext db, IMemoryCache cache, ApiKeyService apiKey)
    {
        _logger = logger;
        _db     = db;
        _cache  = cache;
        _apiKey = apiKey;
    }

    [HttpPost("me")]
    [RateLimit(4, seconds: 1)]
    public IActionResult CheckUserAuth()
    {
        try
        {
            if (TryGetAuthenticatedUser(out var user))
            {
                return ApiResult(new
                {
                    user.Sub,
                    user.Username,
                    user.Avatar,
                    user.Disabled,
                    user.Admin,
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while attempting to authenticate user");
            HttpContext.Response.Cookies.Delete(GlobalShared.SessionCookieName);
        }
        
        return ApiResult();
    }
    
    [HttpPost("api-key")]
    [RateLimit(2, seconds: 1)]
    public async Task<IActionResult> GetUserApiKeyAsync()
    {
        if (TryGetAuthenticatedUser(out var user))
        {
            var apiKey = await _db.GetApiKeyByUserSubAsync(user.Sub);
            return ApiResult(new
            {
                apiKey           = apiKey.Key,
                canRequestNewKey = apiKey.CanRequestNewKey()
            });
        }

        return ApiResult();
    }
    
    [HttpPost("regenerate-api-key")]
    [RateLimit(1, seconds: 60)]
    public async Task<IActionResult> RegenerateApiKeyAsync()
    {
        if (TryGetAuthenticatedUser(out var user))
        {
            var apiKey = await _db.GetApiKeyByUserIdAsync(user.Id);
            if (apiKey.CanRequestNewKey())
            {
                await _apiKey.RegenerateAsync(user.Id);
                return ApiResult();
            }
        }

        return Forbid();
    }
    
    [HttpPost("get-user-links")]
    [RateLimit(2, seconds: 1)]
    public async Task<IActionResult> GetAuthUserLinksAsync()
    {
        if (TryGetAuthenticatedUser(out var user))
        {
            try
            {
                var links = await _db.Links
                                     .Where(l => l.CreatorId == user.Sub && l.Disabled == false)
                                     .Select(l => new 
                                     {
                                         l.Shortcode,
                                         l.Shortlink,
                                         l.Destination,
                                         l.DeletionKey,
                                         l.ExpiresAt,
                                         l.CreatedAt,
                                     })
                                     .OrderByDescending(l => l.CreatedAt)
                                     .ToListAsync();

                return ApiResult(links);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to retrieve auth'd user links");
                
                return new StatusCodeResult(500);
            }
        }

        return Unauthorized();
    }
    
    [HttpPost("get-all-links")]
    [RateLimit(2, seconds: 1)]
    [RequireAdmin]
    public async Task<IActionResult> GetAllLinksAsync()
    {
        try
        {
            var links = await _db.Links.Select(l => new
                                 {
                                     l.CreatorId,
                                     l.Shortcode,
                                     l.Shortlink,
                                     l.Destination,
                                     l.DeletionKey,
                                     l.ExpiresAt,
                                     l.CreatedAt,
                                     User = new
                                     {
                                         l.User.Username,
                                         l.User.Anonymous,
                                     }
                                 })
                                 .OrderByDescending(l => l.CreatedAt)
                                 .ToListAsync();

            return ApiResult(links);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unable to retrieve all user links");
                
            return Problem();
        }
    }

    [HttpPost("latest-commit")]
    public IActionResult GetLatestCommitHash()
    {
        if (_cache.TryGetValue("latestSha", out string hash))
        {
            return ApiResult(new
            {
                hash
            });
        }
        
        return Problem();
    }
}
