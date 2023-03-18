namespace Tetra.Models.Responses;

public record LinkInfoResponse
{
    public string    Destination { get; set; }
    public DateTime? ExpiresAt   { get; set; }
}
