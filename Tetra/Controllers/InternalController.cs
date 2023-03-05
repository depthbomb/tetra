using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Tetra.Models;
using Tetra.Services;
using Tetra.Exceptions;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("internal")]
[CsrfProtected]
[ApiExplorerSettings(IgnoreApi = true)]
public class InternalController : BaseController
{
    private readonly ILogger<InternalController> _logger;
    private readonly TetraContext                _db;
    private readonly UserService                 _users;
    private readonly GitHubService               _github;

    public InternalController(ILogger<InternalController> logger,
                              TetraContext db,
                              UserService users,
                              GitHubService github)
    {
        _logger = logger;
        _db     = db;
        _users  = users;
        _github = github;
    }

    [HttpPost("checkpoint")]
    [RateLimit(2, seconds: 1)]
    public IActionResult CheckUserAuth()
    {
        bool auth = false;
        if (HttpContext.Items.TryGetValue("User", out var userItem))
        {
            try
            {
                JsonSerializer.Deserialize<AuthUser>(userItem.ToString());

                auth = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to validate user authentication");
            }
        }
        
        return ApiResult(new
        {
            auth
        });
    }
    
    [HttpPost("get-user-links")]
    [RateLimit(2, seconds: 1)]
    public async Task<IActionResult> GetAuthUserLinksAsync()
    {
        if (TryGetAuthenticatedUser(out var authUser))
        {
            try
            {
                var links = await _db.Links
                                     .Where(l => l.Creator == authUser.Id && l.Disabled == false)
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

    [HttpPost("api-key")]
    [RateLimit(1, seconds: 1)]
    public async Task<IActionResult> GetOrCreateApiKeyAsync()
    {
        if (TryGetAuthenticatedUser(out var authUser))
        {
            try
            {
                string apiKey = await _users.GetOrCreateApiKeyAsync(authUser.Id);

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
    [RateLimit(2, seconds: 1)]
    public async Task<IActionResult> GetLatestCommitHashAsync()
    {
        var hash = await _github.GetLatestCommitShaAsync();

        return ApiResult(new
        {
            hash
        });
    }
}
