using Microsoft.AspNetCore.Mvc.Filters;

using Tetra.Services;

namespace Tetra.Middleware.Attributes;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public class CspAttribute : BaseMiddlewareAttribute
{
    private const string CspHeaderKey = "Content-Security-Policy";

    public override Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        var ctx = context.HttpContext;
        var res = ctx.Response;

        if (!res.Headers.ContainsKey(CspHeaderKey))
        {
            var security = ctx.RequestServices.GetRequiredService<SecurityService>();
            var nonce    = security.GenerateCspNonce();
        
            ctx.Items.Add("CspNonce", nonce);
            res.Headers.Add(CspHeaderKey, $"script-src 'self' 'nonce-{nonce}';");
        }

        return base.OnResultExecutionAsync(context, next);
    }
}
