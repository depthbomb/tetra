namespace Tetra.Models.Responses;

public record AjaxUserLinksResponse
{
    public string    Shortcode   { get; set; }
    public string    Shortlink   { get; set; }
    public string    Destination { get; set; }
    public string    DeletionKey { get; set; }
    public DateTime? ExpiresAt   { get; set; }
    public DateTime  CreatedAt   { get; set; }
}
