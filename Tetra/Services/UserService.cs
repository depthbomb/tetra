using System.Security.Claims;
using System.Security.Cryptography;

using Tetra.Models;
using Tetra.Data.Entities;

namespace Tetra.Services;

public class UserService
{
    private readonly TetraContext  _db;
    private readonly ApiKeyService _apiKey;

    public UserService(TetraContext db, ApiKeyService apiKey)
    {
        _db     = db;
        _apiKey = apiKey;
    }

    public async Task<User> GetOrCreateUserAsync(List<Claim> claims)
    {
        var userExists = await UserExistsAsync(claims);
        if (userExists)
        {
            return await GetFromClaimsAsync(claims);
        }

        return await CreateFromClaimsAsync(claims);
    }

    public string CreateGravatarUrl(string inputEmail, int size = 64, string rating = "g")
    {
        var bytes     = Encoding.ASCII.GetBytes(inputEmail);
        var hashBytes = MD5.HashData(bytes);
        var md5Hash   = Convert.ToHexString(hashBytes).ToLower();

        return $"https://gravatar.com/avatar/{md5Hash}?s={size}&r={rating}";
    }

    public async Task<bool> UserExistsAsync(IEnumerable<Claim> claims)
    {
        var parsedClaims = ParseClaims(claims);
        
        return await _db.UserExistsBySubAsync(parsedClaims.Sub);
    }

    public async Task<User> GetByApiKeyAsync(string key)
    {
        var user = await _db.GetUserByApiKeyAsync(key);

        return user;
    }

    private async Task<User> GetFromClaimsAsync(IEnumerable<Claim> claims)
    {
        var parsedClaims = ParseClaims(claims);
        
        return await _db.GetUserBySubAsync(parsedClaims.Sub);
    }

    private async Task<User> CreateFromClaimsAsync(IEnumerable<Claim> claims)
    {
        var parsedClaims = ParseClaims(claims);
        var user = new User
        {
            Sub      = parsedClaims.Sub,
            Username = parsedClaims.PreferredUsername,
            Email    = parsedClaims.Email,
            Avatar   = CreateGravatarUrl(parsedClaims.Email),
            Roles    = parsedClaims.Groups,
            Admin    = parsedClaims.Groups.Contains("tetra_admin")
        };

        await _db.Users.AddAsync(user);
        
        user.ApiKey = await _apiKey.CreateAsync(user.Id);
        
        await _db.SaveChangesAsync();

        return user;
    }

    private OidcUserInfo ParseClaims(IEnumerable<Claim> claims)
    {
        var userInfo = new OidcUserInfo
        {
            Email             = claims.FirstOrDefault(c => c.Type == "email")?.Value,
            EmailVerified     = bool.Parse(claims.FirstOrDefault(c => c.Type == "email_verified")?.Value),
            Name              = claims.FirstOrDefault(c => c.Type == "name")?.Value,
            GivenName         = claims.FirstOrDefault(c => c.Type == "given_name")?.Value,
            FamilyName        = claims.FirstOrDefault(c => c.Type == "family_name")?.Value,
            PreferredUsername = claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value,
            Nickname          = claims.FirstOrDefault(c => c.Type == "nickname")?.Value,
            Groups            = claims.Where(c => c.Type          == "groups").Select(c => c.Value).ToList(),
            Sub               = claims.FirstOrDefault(c => c.Type == "sub")?.Value,
        };

        return userInfo;
    }
}
