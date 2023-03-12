using Microsoft.AspNetCore.Mvc;

using Tetra.Extensions;
using Tetra.Data.Entities;

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

    protected bool TryGetAuthenticatedUser(out User user)
    {
        user = default;
        if (HttpContext.Items.TryGetValueAs(UserContextItemKey, out user))
        {
            return true;
        }
        
        return false;
    }
}
