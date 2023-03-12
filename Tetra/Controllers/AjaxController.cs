using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

using Tetra.Services;
using Tetra.Exceptions;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("ajax")]
[ApiExplorerSettings(IgnoreApi = true)]
public class AjaxController : BaseController
{
    private readonly ILogger<AjaxController> _logger;
    private readonly TetraContext            _db;
    private readonly IMemoryCache            _cache;
    private readonly UserService             _users;

    public AjaxController(ILogger<AjaxController> logger,
                          TetraContext db,
                          IMemoryCache cache,
                          UserService users)
    {
        _logger = logger;
        _db     = db;
        _cache  = cache;
        _users  = users;
    }

    [HttpPost("me")]
    [RateLimit(4, seconds: 1)]
    public IActionResult CheckUserAuth()
    {
        if (TryGetAuthenticatedUser(out var user))
        {
            return ApiResult(new
            {
                user.Sub,
                user.Username,
                user.Avatar,
                user.ApiKey,
                user.Admin,
            });
        }
        
        return ApiResult();
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
                                     .Where(l => l.Creator == user.Sub && l.Disabled == false)
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
                
            return Problem();
        }
    }

    [HttpPost("api-key")]
    public async Task<IActionResult> GetOrCreateApiKeyAsync()
    {
        if (TryGetAuthenticatedUser(out var user))
        {
            try
            {
                string apiKey = await _users.GetOrCreateApiKeyAsync(user.Sub);

                return ApiResult(new
                {
                    apiKey
                });
            }
            catch (UserNotFoundException ex)
            {
                _logger.LogError(ex, "Unable to get or create user API key");

                return Unauthorized();
            }
        }

        return Unauthorized();
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
