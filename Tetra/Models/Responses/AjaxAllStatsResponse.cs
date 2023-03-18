namespace Tetra.Models.Responses;

public record AjaxAllStatsResponse
{
    public int TotalLinks { get; set; }
    public int TotalUsers { get; set; }
}
