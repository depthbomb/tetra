using Microsoft.AspNetCore.Http;

using Tetra.Services;

namespace Tetra.Middleware;

public class AuthMiddleware
{
    private readonly RequestDelegate         _next;
    private readonly ILogger<AuthMiddleware> _logger;
    private readonly AuthService             _auth;

    public AuthMiddleware(RequestDelegate next, ILogger<AuthMiddleware> logger, AuthService auth)
    {
        _next   = next;
        _logger = logger;
        _auth   = auth;
    }
    
    public async Task InvokeAsync(HttpContext ctx)
    {
        string protectedSub = string.Empty;
        if (ctx.Request.Headers.TryGetValue("authorization", out var authorizationValue))
        {
            protectedSub = authorizationValue;
            
            _logger.LogDebug("Resolved user token from Authorization header");
        }
        else if (ctx.Request.Cookies.TryGetValue(GlobalShared.SessionCookieName, out var cookieValue))
        {
            protectedSub = cookieValue;
            
            _logger.LogDebug("Resolved user token from cookies");
        }

        if (protectedSub != string.Empty && !ctx.Items.ContainsKey(GlobalShared.UserContextItemKeyName))
        {
            var db = ctx.RequestServices.GetRequiredService<TetraContext>();
            
            try
            {
                var userSub = _auth.Unprotect(protectedSub);
                var user    = await db.GetUserBySubAsync(userSub);
                
                ctx.Items.Add(GlobalShared.UserContextItemKeyName, user);
                
                _logger.LogDebug("User object successfully attached to context");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Attempted to unprotected invalid protected user sub: {Token}", protectedSub);
                ctx.Response.Cookies.Delete(GlobalShared.SessionCookieName);
            }
        }

        await _next(ctx);
    }
}
