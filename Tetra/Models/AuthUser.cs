namespace Tetra.Models;

public record AuthUser
{
    [JsonPropertyName("id")]
    public string Id       { get; set; }
    
    [JsonPropertyName("username")]
    public string Username { get; set; }
    
    [JsonPropertyName("avatar")]
    public string Avatar   { get; set; }
}
