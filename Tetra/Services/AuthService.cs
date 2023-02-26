using IdentityModel.Client;
using IdentityModel.OidcClient;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.DataProtection;

namespace Tetra.Services;

public class AuthService
{
    public OidcClient Client { get; }
    
    private readonly IDataProtector _protector;
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config, IDataProtectionProvider protectionProvider)
    {
        _config = config;
        Client = new OidcClient(new OidcClientOptions
        {
            Authority    = _config.GetValue<string>("OpenId:Authority"),
            ClientId     = _config.GetValue<string>("OpenId:ClientId"),
            ClientSecret = _config.GetValue<string>("OPENID_SECRET") ?? _config.GetValue<string>("OpenId:ClientSecret"),
            RedirectUri  = "https://localhost:5001/auth/callback",
            Scope        = "openid profile email",
            Policy = new Policy
            {
                Discovery = new DiscoveryPolicy
                {
                    AdditionalEndpointBaseAddresses = new[]
                    {
                        "https://auth.super.fish/application/o/",
                        "https://auth.super.fish/if/"
                    }
                }
            }
        });
        _protector = protectionProvider.CreateProtector("Auth Service Protector");
    }

    /// <inheritdoc cref="IDataProtector.Protect"/>
    public string Protect(string plaintext)
    {
        return _protector.Protect(plaintext);
    }
    
    /// <inheritdoc cref="IDataProtector.Unprotect"/>
    public string Unprotect(string protectedData)
    {
        return _protector.Unprotect(protectedData);
    }
}
