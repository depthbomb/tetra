namespace Tetra.Models;

public record OidcUserInfo
{
    public string       Email             { get; set; }
    public bool         EmailVerified     { get; set; }
    public string       Name              { get; set; }
    public string       GivenName         { get; set; }
    public string       FamilyName        { get; set; }
    public string       PreferredUsername { get; set; }
    public string       Nickname          { get; set; }
    public List<string> Groups            { get; set; }
    public string       Sub               { get; set; }
}
