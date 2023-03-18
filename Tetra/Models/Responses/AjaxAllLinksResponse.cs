namespace Tetra.Models.Responses;

public record AjaxAllLinksResponse
{
    public string           CreatorIp   { get; set; }
    public string           Shortcode   { get; set; }
    public string           Shortlink   { get; set; }
    public string           Destination { get; set; }
    public string           DeletionKey { get; set; }
    public DateTime?        ExpiresAt   { get; set; }
    public DateTime         CreatedAt   { get; set; }
    public AjaxAllLinksUser User        { get; set; }
}

public record AjaxAllLinksUser
{
    public string Username  { get; set; }
    public bool   Anonymous { get; set; }
}
