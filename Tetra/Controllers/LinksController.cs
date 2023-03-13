using Microsoft.AspNetCore.Mvc;

using Tetra.Shared;
using Tetra.Services;
using Tetra.Models.Forms;
using Tetra.Models.Responses;
using Tetra.Middleware.Attributes;
using Tetra.Models.Responses.Links;

namespace Tetra.Controllers;

[Route("api/links")]
[RateLimit(2, seconds: 1)]
[Produces("application/json")]
public class LinksController : BaseController
{
    private readonly LinksService _links;
    private readonly UserService  _users;

    public LinksController(LinksService links, UserService users)
    {
        _links = links;
        _users = users;
    }

    /// <summary>
    ///     Creates a shortlink
    /// </summary>
    /// <param name="body">Shortlink creation options</param>
    /// <param name="key">Optional API key</param>
    /// <response code="201">The shortlink was created successfully</response>
    /// <response code ="400" >There was an issue with one or more request parameters</response>
    [HttpPut]
    [HttpPost("create")]
    [ProducesResponseType(typeof(CreateLinkResponse), 201)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    public async Task<IActionResult> CreateLinkAsync([FromBody] CreateLinkForm body, [FromQuery] string? key)
    {
        var destination = body.Destination;
        var duration    = body.Duration;
        var expiresAt   = body.ExpiresAt;

        if (!_links.IsValidDestination(destination))
        {
            return ApiResult("The provided destination not a valid HTTP/HTTPS URL", 400);
        }
        
        DateTime? linkExpiresAt = null;
        if (duration != null)
        {
            var linkDuration = Duration.Parse(duration);
            linkExpiresAt = DateTime.UtcNow.Add(linkDuration);
        }
        
        // expiresAt overrides duration
        if (expiresAt != null)
        {
            linkExpiresAt = expiresAt;
        }

        string creator;
        bool   anonymous = false;
        if (key != null)
        {
            var user = await _users.GetByApiKeyAsync(key);
            if (user == null)
            {
                return Unauthorized("Invalid API key");
            }

            creator = user.Sub;
        }
        else if (TryGetAuthenticatedUser(out var user))
        {
            creator = user.Sub;
        }
        else
        {
            creator   = HttpContext.Connection.RemoteIpAddress?.ToString();
            anonymous = true;
        }

        var link = await _links.CreateLinkAsync(creator, destination, linkExpiresAt, anonymous);

        return ApiResult(new
        {
            shortcode   = link.Shortcode,
            shortlink   = link.Shortlink,
            destination = link.Destination,
            deletionKey = link.DeletionKey,
            expiresAt   = link.ExpiresAt
        }, 201);
    }
    
    /// <summary>
    ///     Returns basic info about a shortlink
    /// </summary>
    /// <param name="shortcode">The shortlink's shortcode</param>
    /// <response code="200">Info about the shortlink was successfully retrieved</response>
    /// <response code="404">The shortlink does not exist</response>
    [HttpGet("{shortcode}")]
    [ProducesResponseType(typeof(LinkInfoResponse), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<IActionResult> GetLinkInfoAsync(string shortcode)
    {
        var link = await _links.GetLinkByShortcodeAsync(shortcode);
        if (link == null)
        {
            return NotFound();
        }

        return ApiResult(new
        {
            destination = link.Destination,
            expiresAt   = link.ExpiresAt
        });
    }

    /// <summary>
    ///     Deletes a shortlink by its shortcode and deletion key
    /// </summary>
    /// <param name="shortcode">The shortlink's shortcode</param>
    /// <param name="deletionKey">The shortlink's deletion key presented upon creation</param>
    /// <response code="200">Returned regardless of whether the shortlink was deleted or not</response>
    [HttpDelete("{shortcode}/{deletionKey}")]
    [HttpPost("delete/{shortcode}/{deletionKey}")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> DeleteLinkAsync(string shortcode, string deletionKey)
    {
        await _links.DeleteLinkAsync(shortcode, deletionKey);

        return ApiResult();
    }
}
