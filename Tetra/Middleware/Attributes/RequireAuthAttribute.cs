using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Tetra.Middleware.Attributes;

public class RequireAuthAttribute : ActionFilterAttribute
{
    public override Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var ctx = context.HttpContext;
        if (!ctx.Items.TryGetValue(GlobalShared.UserContextItemKeyName, out _))
        {
            context.Result = new UnauthorizedResult();
        }
        
        return base.OnActionExecutionAsync(context, next);
    }
}
