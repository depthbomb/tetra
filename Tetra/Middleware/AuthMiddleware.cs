using Microsoft.AspNetCore.Http;

using Tetra.Services;

namespace Tetra.Middleware;

public class AuthMiddleware
{
    private const string AuthCookieName = "ru";
    
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
        string userToken = string.Empty;
        if (ctx.Request.Headers.TryGetValue("authorization", out var authorizationValue))
        {
            userToken = authorizationValue;
            
            _logger.LogDebug("Resolved user token from Authorization header");
        }
        else if (ctx.Request.Cookies.TryGetValue(AuthCookieName, out var cookieValue))
        {
            userToken = cookieValue;
            
            _logger.LogDebug("Resolved user token from cookies");
        }

        if (userToken != string.Empty)
        {
            try
            {
                var user = _auth.Unprotect(userToken);
                ctx.Items.Add("User", user);
                
                _logger.LogDebug("User object successfully attached to context");
            }
            catch
            {
                _logger.LogWarning("Invalid user token attempted to unprotect: {Token}", userToken);
            }
        }
        
        await _next(ctx);
    }
}
