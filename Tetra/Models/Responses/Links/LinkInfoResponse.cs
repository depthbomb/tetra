namespace Tetra.Models.Responses.Links;

public record LinkInfoResponse
{
    public string    Destination { get; set; }
    public DateTime? ExpiresAt   { get; set; }
}
