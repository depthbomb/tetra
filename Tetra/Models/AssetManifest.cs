public record AssetManifest
{
    [JsonPropertyName("assets")]
    public List<ManifestAsset> Assets { get; set; }
        
    [JsonPropertyName("prefetched")]
    public List<string> Prefetched { get; set; }
}

public record ManifestAsset
{
    [JsonPropertyName("o")]
    public string Original { get; set; }
        
    [JsonPropertyName("v")]
    public string Versioned { get; set; }
}
