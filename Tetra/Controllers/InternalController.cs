﻿using Microsoft.AspNetCore.Mvc;
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
    private readonly LinksService _links;
    private readonly TetraContext _db;
    
    public InternalController(LinksService links, TetraContext db)
    {
        _links = links;
        _db    = db;
    }
    
    [HttpPost("links-count")]
    [RateLimit(2, seconds: 5)]
    public async Task<IActionResult> LinksCountAsync()
    {
        var count = await _links.GetLinksCountAsync();
        return new JsonResult(new
        {
            count = count
        });
    }
    
    [HttpPost("checkpoint")]
    [RateLimit(2, seconds: 1)]
    public IActionResult CheckUserAuth()
    {
        if (HttpContext.Items.TryGetValue("User", out var userItem))
        {
            try
            {
                JsonSerializer.Deserialize<AuthUser>(userItem?.ToString());
                
                return new JsonResult(new
                {
                    auth = true
                });
            }
            catch { }
        }
        
        return new JsonResult(new
        {
            auth = false
        });
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
                                     .Where(l => l.Creator == user.Id && l.Disabled == false)
                                     .Select(l => new 
                                     {
                                         l.Shortcode,
                                         l.Shortlink,
                                         l.Destination,
                                         l.DeletionKey,
                                         l.ExpiresAt,
                                         l.CreatedAt,
                                     })
                                     .ToListAsync();

                return new JsonResult(links);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }

        return Unauthorized();
    }
}
