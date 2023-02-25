using Microsoft.AspNetCore.Mvc.Filters;

using Tetra.Services;

namespace Tetra.Middleware.Attributes;

public class DevOnlyAttribute : BaseMiddlewareAttribute
{
    public override Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        return base.OnResultExecutionAsync(context, next);
    }
}
