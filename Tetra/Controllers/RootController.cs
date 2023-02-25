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
    private readonly AssetService    _assets;
    private readonly SecurityService _security;
    private readonly LinksService    _links;
    
    public RootController(AssetService assets, SecurityService security, LinksService links)
    {
        _assets   = assets;
        _security = security;
        _links    = links;
    }
    
    [Csp]
    [HttpGet]
    public async Task<IActionResult> IndexAsync()
    {
        var model = new SpaViewModel
        {
            ClientJs  = await _assets.BuildAssetTagAsync(HttpContext, "app.ts"),
            ClientCss = await _assets.BuildAssetTagAsync(HttpContext, "app.css"),
            CsrfToken = _security.GenerateCsrfToken(HttpContext.Connection.RemoteIpAddress),
            User      = "{}"
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

    [Route("error-handler-route/{code}")]
    public IActionResult HandleError(int code = 500)
    {
        return HttpContext.ApiErrorResult(GlobalShared.HttpStatusMessages[code], code);
    }
}
