using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

using Tetra.Models;

namespace Tetra.Middleware.Attributes;

public class RequireAdminAttribute : ActionFilterAttribute
{
    public override Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var ctx = context.HttpContext;
        if (ctx.Items.TryGetValue("User", out var userItem))
        {
            var user = JsonSerializer.Deserialize<AuthUser>(userItem.ToString());
            if (!user.Admin)
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
