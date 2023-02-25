using Microsoft.AspNetCore.Http;

namespace Tetra.Middleware;

public class RequestIdMiddleware
{
    private const string RequestIdHeaderKey = "x-request-id";
    
    private readonly RequestDelegate _next;
    
    public RequestIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    
    public async Task InvokeAsync(HttpContext ctx)
    {
        if (!ctx.Response.Headers.ContainsKey(RequestIdHeaderKey))
        {
            ctx.Response.Headers.Add(RequestIdHeaderKey, ctx.TraceIdentifier);
        }
        
        await _next(ctx);
    }
}
