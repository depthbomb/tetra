using System.Net;
using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;

namespace Tetra.Services;

public class SecurityService
{
    private readonly IDataProtector _csrfProtector;
    
    public SecurityService(IDataProtectionProvider protectionProvider)
    {
        _csrfProtector = protectionProvider.CreateProtector("Tetra CSRF");
    }

    public string GenerateCsrfToken(IPAddress ip)
    {
        return _csrfProtector.Protect(ip.ToString());
    }
    
    public bool IsCsrfTokenValid(string token, IPAddress ip)
    {
        var unprotectedToken = _csrfProtector.Unprotect(token);
        return ip.ToString() == unprotectedToken;
    }

    public string GenerateCspNonce() => WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
}
