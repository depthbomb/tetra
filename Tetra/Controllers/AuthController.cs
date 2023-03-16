using IdentityModel.OidcClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

using Tetra.Services;

namespace Tetra.Controllers;

[Route("auth")]
[ApiExplorerSettings(IgnoreApi = true)]
public class AuthController : BaseController
{
    private const string StateCookieName = "state";
    
    private readonly AuthService _auth;
    private readonly UserService _user;
    
    public AuthController(AuthService auth, UserService user)
    {
        _auth = auth;
        _user = user;
    }
    
    [HttpGet("login")]
    public async Task<IActionResult> StartLoginFlowAsync()
    {
        var state = await _auth.Client.PrepareLoginAsync();
        
        HttpContext.Response.Cookies.Append(StateCookieName, _auth.Protect(JsonSerializer.Serialize(state)));
        
        return Redirect(state.StartUrl);
    }
    
    [HttpGet("logout")]
    public IActionResult LogOut()
    {
        HttpContext.Response.Cookies.Delete(StateCookieName);
        HttpContext.Response.Cookies.Delete(GlobalShared.SessionCookieName);

        return Redirect("/");
    }
    
    [HttpGet("callback")]
    public async Task<IActionResult> ReceiveLoginCallbackAsync([FromQuery] string code, [FromQuery] string state)
    {
        if (!HttpContext.Request.Cookies.TryGetValue(StateCookieName, out var authorizeStateCookie))
        {
            return BadRequest();
        }

        HttpContext.Response.Cookies.Delete(StateCookieName);
        
        var authorizeState   = JsonSerializer.Deserialize<AuthorizeState>(_auth.Unprotect(authorizeStateCookie));
        var tokenResponse    = await _auth.Client.ProcessResponseAsync($"?state={state}&code={code}", authorizeState);
        var userInfoResponse = await _auth.Client.GetUserInfoAsync(tokenResponse.AccessToken);
        var user             = await _user.GetOrCreateUserAsync(userInfoResponse.Claims.ToList());

        HttpContext.Response.Cookies.Append(GlobalShared.SessionCookieName, _auth.Protect(user.Id.ToString()), new CookieOptions
        {
            Expires = DateTimeOffset.Now.AddYears(1)
        });

        return Redirect("/");
    }
}
