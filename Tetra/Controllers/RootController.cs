using System.Web;
using Microsoft.AspNetCore.Mvc;

using Tetra.Services;
using Tetra.ViewModels;
using Tetra.Extensions;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("/")]
[ApiExplorerSettings(IgnoreApi = true)]
public class RootController : BaseController
{
    private readonly SecurityService _security;
    private readonly LinksService    _links;

    public RootController(SecurityService security, LinksService links)
    {
        _security = security;
        _links    = links;
    }
    
    [Csp]
    [HttpGet]
    public IActionResult Index()
    {
        var model = new SpaViewModel
        {
            CsrfToken        = _security.GenerateCsrfToken(HttpContext.Connection.RemoteIpAddress),
            User             = "{}",
            StatsHubEndpoint = GlobalShared.StatsHubEndpoint
        };

        if (HttpContext.Items.TryGetValue("User", out var user))
        {
            model.User = HttpUtility.UrlEncode(user?.ToString());
        }
        
        return View(model);
    }
    
    [HttpGet("{shortcode}")]
    public async Task<IActionResult> AttemptLinkRedirectAsync(string shortcode)
    {
        var link = await _links.GetLinkByShortcodeAsync(shortcode);
        if (link == null)
        {
            return NotFound();
        }

        return Redirect(link.Destination);
    }

    [Route("error-handler-route")]
    public IActionResult HandleError([FromQuery] int code)
    {
        return HttpContext.ApiErrorResult(GlobalShared.HttpStatusMessages[code], code);
    }
}
