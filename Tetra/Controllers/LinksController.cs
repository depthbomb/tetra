using Microsoft.AspNetCore.Mvc;

using Tetra.Shared;
using Tetra.Services;
using Tetra.Models.Forms;
using Tetra.Middleware.Attributes;
using Tetra.Models.Responses.Links;

namespace Tetra.Controllers;

[Route("api/links")]
[RateLimit(2, seconds: 1)]
[Produces("application/json")]
public class LinksController : BaseController
{
    private readonly LinksService   _links;
    
    public LinksController(LinksService links)
    {
        _links  = links;
    }
    
    /// <summary>
    ///     Creates a shortlink
    /// </summary>
    /// <response code="201">The shortlink was created successfully</response>
    [HttpPost("create")]
    [ProducesResponseType(typeof(CreateLinkResponse), 201)]
    public async Task<IActionResult> CreateLinkAsync([FromBody] CreateLinkForm body)
    {
        var destination = body.Destination;
        var duration    = body.Duration;
        var expiresAt   = body.ExpiresAt;
        
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

        var creator = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (TryGetAuthenticatedUser(out var user))
        {
            creator = user.Id;
        }

        var link = await _links.CreateLinkAsync(creator, destination, linkExpiresAt);

        return new JsonResult(new
        {
            shortcode   = link.Shortcode,
            shortlink   = link.Shortlink,
            destination = link.Destination,
            deletionKey = link.DeletionKey,
            expiresAt   = link.ExpiresAt
        })
        {
            StatusCode = 201
        };
    }
    
    /// <summary>
    ///     Returns basic info about a shortlink
    /// </summary>
    /// <param name="shortcode">The shortlink's shortcode</param>
    /// <response code="200">Info about the shortlink was successfully retrieved</response>
    /// <response code="404">The shortlink does not exist</response>
    [HttpGet("{shortcode}")]
    [ProducesResponseType(typeof(LinkInfoResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetLinkInfoAsync(string shortcode)
    {
        var link = await _links.GetLinkByShortcodeAsync(shortcode);
        if (link == null)
        {
            return NotFound();
        }

        return new JsonResult(new
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
    [HttpDelete("delete/{shortcode}/{deletionKey}")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> DeleteLinkAsync(string shortcode, string deletionKey)
    {
        await _links.DeleteLinkAsync(shortcode, deletionKey);

        return new JsonResult(new {});
    }
}
