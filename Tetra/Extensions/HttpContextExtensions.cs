using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

using Tetra.Models.Responses;

namespace Tetra.Extensions;

public static class HttpContextExtensions
{
    public static string BaseUrl(this HttpRequest req)
    {
        if (req == null)
        {
            return null;
        }
        
        var uriBuilder = new UriBuilder(req.Scheme, req.Host.Host, req.Host.Port ?? -1);
        if (uriBuilder.Uri.IsDefaultPort)
        {
            uriBuilder.Port = -1;
        }

        return uriBuilder.Uri.AbsoluteUri;
    }

    public static IActionResult ApiErrorResult(this HttpContext ctx, string message = null, int statusCode = 200)
    {
        return new JsonResult(new ApiResponse
        {
            RequestId = ctx.TraceIdentifier,
            Message   = message
        })
        {
            StatusCode = statusCode
        };
    }
}
