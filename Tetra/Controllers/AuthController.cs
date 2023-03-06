using IdentityModel.OidcClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

using Tetra.Models;
using Tetra.Services;

namespace Tetra.Controllers;

[Route("auth")]
[ApiExplorerSettings(IgnoreApi = true)]
public class AuthController : BaseController
{
    private const string StateCookieName   = "state";
    private const string SessionCookieName = "ru";
    
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
        HttpContext.Response.Cookies.Delete(SessionCookieName);

        return RedirectToAction("Index", "Root");
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

        var userCookieData = JsonSerializer.Serialize(new AuthUser
        {
            Id       = user.Sub,
            Username = user.Username,
            Avatar   = user.Avatar,
            Admin    = user.Admin
        });
        
        HttpContext.Response.Cookies.Append(SessionCookieName, _auth.Protect(userCookieData), new CookieOptions
        {
            Expires = DateTimeOffset.Now.AddYears(1)
        });

        return RedirectToAction("Index", "Root");
    }
}
