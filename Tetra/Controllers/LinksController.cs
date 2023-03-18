using Microsoft.AspNetCore.Mvc;

using Tetra.Shared;
using Tetra.Services;
using Tetra.Models.Forms;
using Tetra.Data.Entities;
using Tetra.Models.Responses;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("api/links")]
[RateLimit(2, seconds: 1)]
[Produces("application/json")]
public class LinksController : BaseController
{
    private readonly TetraContext _db;
    private readonly LinksService _links;
    private readonly UserService  _users;

    public LinksController(TetraContext db, LinksService links, UserService users)
    {
        _db    = db;
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
    [ProducesResponseType(typeof(CreateLinkResponse), 200)]
    [ProducesResponseType(typeof(ApiErrorResponse), 400)]
    public async Task<ActionResult<CreateLinkResponse>> CreateLinkAsync([FromBody] CreateLinkForm body, [FromQuery] string? key)
    {
        var destination = body.Destination;
        var duration    = body.Duration;
        var expiresAt   = body.ExpiresAt;

        if (!_links.IsValidDestination(destination))
        {
            return BadRequest("The provided destination not a valid HTTP/HTTPS URL");
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

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        
        User user;
        if (key != null)
        {
            user = await _users.GetByApiKeyAsync(key);
            if (user == null)
            {
                return Unauthorized("Invalid API key");
            }
        }
        else if (TryGetAuthenticatedUser(out user)) {}
        else
        {
            user = await _db.GetAnonymousUserAsync();
        }

        var link = await _links.CreateLinkAsync(user.Id, ip, destination, linkExpiresAt);

        return new CreateLinkResponse
        {
            Shortcode   = link.Shortcode,
            Shortlink   = link.Shortlink,
            Destination = link.Destination,
            DeletionKey = link.DeletionKey,
            ExpiresAt   = link.ExpiresAt
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
    [ProducesResponseType(typeof(ApiErrorResponse), 404)]
    public async Task<ActionResult<LinkInfoResponse>> GetLinkInfoAsync(string shortcode)
    {
        var link = await _links.GetLinkByShortcodeAsync(shortcode);
        if (link == null)
        {
            return NotFound();
        }

        return new LinkInfoResponse
        {
            Destination = link.Destination,
            ExpiresAt   = link.ExpiresAt
        };
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

        return Ok();
    }
}
