using Microsoft.AspNetCore.Html;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;

using Tetra.Shared;

namespace Tetra.Services;

public class AssetService
{
    private AssetManifest _manifest;
    private string        _preloadTags = string.Empty;

    private readonly IConfiguration                    _config;
    private readonly string                            _baseUrl;
    private readonly IDictionary<string, List<string>> _sriHashes;

    public AssetService(IConfiguration config)
    {
        _config    = config;
        _baseUrl   = config.GetValue<string>("BaseUrl");
        _sriHashes = new Dictionary<string, List<string>>();
    }

    public async Task<string> GetVersionedFileNameAsync(string originalName)
    {
        var manifest = await GetManifestAsync();
        var record   = manifest.Assets.FirstOrDefault(a => a.Original == originalName);
        if (record == null)
        {
            throw new KeyNotFoundException($"No asset manifest key \"{originalName}\"");
        }
        
        return record.Versioned;
    }

    public async Task<string> GetVersionedFilePathAsync(string originalName)
    {
        var fileName = await GetVersionedFileNameAsync(originalName);

        return Path.Combine(Constants.WwwRootPath, fileName);
    }

    public async Task<string> GetVersionedFileUrlAsync(string originalName)
    {
        var fileName = await GetVersionedFileNameAsync(originalName);

        return $"{_baseUrl}/{fileName}";
    }

    public async Task<List<string>> GetSriHashesAsync(string originalName)
    {
        if (!_sriHashes.ContainsKey(originalName) || !_config.GetValue<bool>("Production"))
        {
            var hashes    = new List<string>();
            var filePath  = await GetVersionedFilePathAsync(originalName);
            var fileBytes = await File.ReadAllBytesAsync(filePath);
            
            var sha256Hash = SHA256.HashData(fileBytes);
            var sha384Hash = SHA384.HashData(fileBytes);
            var sha512Hash = SHA512.HashData(fileBytes);
                
            hashes.Add("sha256-" + Convert.ToBase64String(sha256Hash));
            hashes.Add("sha384-" + Convert.ToBase64String(sha384Hash));
            hashes.Add("sha512-" + Convert.ToBase64String(sha512Hash));

            _sriHashes[originalName] = hashes;
        }

        return _sriHashes[originalName];
    }
    
    public HtmlString RenderPreloadElements()
    {
        if (_preloadTags == null || !_config.GetValue<bool>("Production"))
        {
            var sb = new StringBuilder();
            foreach (var asset in _manifest.Prefetched)
            {
                if (asset.EndsWith(".js"))
                {
                    sb.Append($"<link rel=\"modulepreload\" href=\"{asset}\" as=\"script\">");
                }
                else if (asset.EndsWith(".css"))
                {
                    sb.Append($"<link rel=\"preload\" href=\"{asset}\" as=\"style\">");
                }
                else if (asset.EndsWith(".woff2") || asset.EndsWith(".woff"))
                {
                    sb.Append($"<link rel=\"preload\" href=\"{asset}\" as=\"font\" crossorigin=\"anonymous\">");
                }
            }

            _preloadTags = sb.ToString();
        }

        return new HtmlString(_preloadTags);
    }

    private async Task<AssetManifest> GetManifestAsync()
    {
        if (_manifest == null || !_config.GetValue<bool>("Production"))
        {
            string manifestPath = Path.Combine(Constants.WwwRootPath, "manifest.json");
            if (!File.Exists(manifestPath))
            {
                throw new FileNotFoundException($"Asset manifest not found at expected location \"{manifestPath}\"");
            }
            
            await using (var fs = File.OpenRead(manifestPath))
            {
                _manifest = await JsonSerializer.DeserializeAsync<AssetManifest>(fs);
            }
        }

        return _manifest;
    }
}
