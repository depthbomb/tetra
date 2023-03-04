using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Tetra.Models;
using Tetra.Services;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("internal")]
[CsrfProtected]
[ApiExplorerSettings(IgnoreApi = true)]
public class InternalController : BaseController
{
    private readonly TetraContext  _db;
    private readonly GitHubService _github;

    public InternalController(TetraContext db, GitHubService github)
    {
        _db     = db;
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
            catch { }
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
                // TODO move this logic to UserService

                var user = await _db.GetUserBySubAsync(authUser.Id);
                if (user == null)
                {
                    return BadRequest();
                }

                string apiKey;
                if (user.ApiKey != null)
                {
                    apiKey = user.ApiKey;
                }
                else
                {
                    apiKey      = Guid.NewGuid().ToString();
                    user.ApiKey = apiKey;
                }

                await _db.SaveChangesAsync();
                
                return ApiResult(new
                {
                    apiKey
                });
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
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
