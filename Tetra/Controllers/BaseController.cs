using Microsoft.AspNetCore.Mvc;
using Tetra.Extensions;
using Tetra.Models;

namespace Tetra.Controllers;

public abstract class BaseController : Controller
{
    private const string UserContextItemKey = "User";

    protected IActionResult ApiResult(object data = default, int statusCode = 200)
    {
        if (statusCode >= 400)
        {
            return HttpContext.ApiErrorResult(data as string, statusCode);
        }
        
        return new JsonResult(data ?? new object())
        {
            StatusCode = statusCode
        };
    }

    protected bool TryGetAuthenticatedUser(out AuthUser user)
    {
        user = null;
        if (HttpContext.Items.TryGetValue(UserContextItemKey, out var userItem))
        {
            user = JsonSerializer.Deserialize<AuthUser>(userItem.ToString());

            return true;
        }
        
        return false;
    }
}
