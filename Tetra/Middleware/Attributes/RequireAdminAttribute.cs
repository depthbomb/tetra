using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

using Tetra.Data.Entities;

namespace Tetra.Middleware.Attributes;

public class RequireAdminAttribute : ActionFilterAttribute
{
    public override Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var ctx = context.HttpContext;
        if (ctx.Items.TryGetValue("User", out var userItem))
        {
            if (!((User)userItem)!.Admin)
            {
                context.Result = new UnauthorizedResult();
            }
        }
        else
        {
            context.Result = new UnauthorizedResult();
        }
        
        return base.OnActionExecutionAsync(context, next);
    }
}
