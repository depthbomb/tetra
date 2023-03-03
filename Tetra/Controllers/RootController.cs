using Microsoft.AspNetCore.Mvc;

using Tetra.Services;
using Tetra.Extensions;
using Tetra.Middleware.Attributes;

namespace Tetra.Controllers;

[Route("/")]
[ApiExplorerSettings(IgnoreApi = true)]
public class RootController : BaseController
{
    private readonly LinksService _links;

    public RootController(LinksService links)
    {
        _links = links;
    }
    
    [Csp]
    [HttpGet]
    public IActionResult Index()
    {
        return View();
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
