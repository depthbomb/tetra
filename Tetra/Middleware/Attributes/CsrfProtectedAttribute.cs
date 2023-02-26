using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

using Tetra.Services;

namespace Tetra.Middleware.Attributes;

public class CsrfProtectedAttribute : BaseMiddlewareAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var ctx    = context.HttpContext;
        var logger = ctx.RequestServices.GetRequiredService<ILogger<CsrfProtectedAttribute>>();
        if (!ctx.Request.Headers.TryGetValue("x-csrf-token", out var csrfValue))
        {
            context.Result = new StatusCodeResult(428);
        }
        else
        {
            string csrfToken = csrfValue;
            var    security  = context.HttpContext.RequestServices.GetRequiredService<SecurityService>();
            try
            {
                var ip = ctx.Connection.RemoteIpAddress;
                if (!security.IsCsrfTokenValid(csrfToken, ip))
                {
                    context.Result = new StatusCodeResult(412);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "CSRF token decrypting failed, returning 412");
                context.Result = new StatusCodeResult(412);
            }
        }
        
        base.OnActionExecuting(context);
    }
}
