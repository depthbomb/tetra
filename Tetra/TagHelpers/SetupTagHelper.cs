using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Razor.TagHelpers;

using Tetra.Hubs;
using Tetra.Services;

namespace Tetra.TagHelpers;

[HtmlTargetElement("setup")]
public class SetupTagHelper : TagHelper
{
    private readonly IHttpContextAccessor _context;
    private readonly SecurityService      _security;

    public SetupTagHelper(IHttpContextAccessor context, SecurityService security)
    {
        _context  = context;
        _security = security;
    }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var ctx = _context.HttpContext;
        
        output.TagName = "meta";
        output.TagMode = TagMode.StartTagOnly;
        output.Attributes.SetAttribute("name", "tetra/config/setup");
        
        if (ctx!.Items.TryGetValue("User", out var user))
        {
            output.Attributes.SetAttribute("data-user", HttpUtility.UrlEncode(user!.ToString()));
        }
        
        output.Attributes.SetAttribute("data-csrf-token", _security.GenerateCsrfToken(ctx.Connection.RemoteIpAddress));

        output.Attributes.SetAttribute("data-stats-hub", StatsHub.Endpoint);
    }
}
