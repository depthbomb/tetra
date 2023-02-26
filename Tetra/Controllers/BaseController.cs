using Microsoft.AspNetCore.Mvc;
using Tetra.Models;

namespace Tetra.Controllers;

public abstract class BaseController : Controller
{
    private const string UserContextItemKey = "User";

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
