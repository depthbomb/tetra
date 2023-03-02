using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using System.Text.Encodings.Web;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;

using Tetra.Shared;

namespace Tetra.Services;

public class AssetService
{
    private Asset[] _manifest;

    private readonly string                            _baseUrl;
    private readonly IDictionary<string, List<string>> _sriHashes;

    public AssetService(IConfiguration config)
    {
        _baseUrl   = config.GetValue<string>("Urls").Split(";")[0];
        _sriHashes = new Dictionary<string, List<string>>();
    }

    public async Task<string> GetVersionedFileNameAsync(string originalName)
    {
        var manifest = await GetManifestAsync();
        var record   = manifest.FirstOrDefault(a => a.Original == originalName);
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
        if (!_sriHashes.ContainsKey(originalName))
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

    private async Task<Asset[]> GetManifestAsync()
    {
        if (_manifest == null)
        {
            string manifestPath = Path.Combine(Constants.WwwRootPath, "manifest.json");
            if (!File.Exists(manifestPath))
            {
                throw new FileNotFoundException($"Asset manifest not found at expected location \"{manifestPath}\"");
            }
            
            await using (var fs = File.OpenRead(manifestPath))
            {
                _manifest = await JsonSerializer.DeserializeAsync<Asset[]>(fs);
            }
        }

        return _manifest;
    }

    private record Asset
    {
        [JsonPropertyName("o")]
        public string Original { get; set; }
        
        [JsonPropertyName("v")]
        public string Versioned { get; set; }
    }
}
