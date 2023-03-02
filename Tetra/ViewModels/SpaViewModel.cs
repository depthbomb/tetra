namespace Tetra.ViewModels;

public record SpaViewModel
{
    public string     CsrfToken        { get; set; }
    public string     User             { get; set; }
    public string     StatsHubEndpoint { get; set; }
}
