using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using Tetra.Hubs;
using Tetra.Shared;
using Tetra.Data.Entities;

namespace Tetra.Services;

public class LinksService
{
    private readonly TetraContext          _db;
    private readonly IHubContext<StatsHub> _stats;
    private readonly string                _baseUrl;

    public LinksService(IConfiguration config, TetraContext db, IHubContext<StatsHub> stats)
    {
        _db      = db;
        _stats   = stats;
        _baseUrl = config.GetValue<string>("Urls").Split(";")[0];
    }

    /// <inheritdoc cref="TetraContext.GetLinksCountAsync"/>
    public async Task<int> GetLinksCountAsync() => await _db.GetLinksCountAsync();

    /// <inheritdoc cref="TetraContext.GetLinkByShortcodeAsync"/>
    public async Task<Link> GetLinkByShortcodeAsync(string shortcode) => await _db.GetLinkByShortcodeAsync(shortcode);

    public async Task<Link> CreateLinkAsync(string creator, string destination, DateTime? expiresAt = null)
    {
        var shortcode   = await GenerateUnusedShortcodeAsync();
        var deletionKey = IdGenerator.Generate(64);
        var link = new Link
        {
            Creator     = creator,
            Shortcode   = shortcode,
            Shortlink   = $"{_baseUrl}/{shortcode}",
            Destination = destination,
            DeletionKey = deletionKey,
            ExpiresAt   = expiresAt
        };

        await _db.Links.AddAsync(link);
        await _db.SaveChangesAsync();
        
        // Broadcast total shortlink count to all clients connected to the stats hub
        await _stats.Clients.All.SendAsync("TotalShortlinks", await _db.GetLinksCountAsync());
        
        return link;
    }

    public async Task DeleteLinkAsync(string shortcode, string deletionKey)
    {
        var link = await _db.Links.FirstOrDefaultAsync(l => l.Shortcode == shortcode && l.DeletionKey == deletionKey);
        if (link != null)
        {
            _db.Links.Remove(link);
            await _db.SaveChangesAsync();
        }
    }
    
    public bool IsValidDestination(string url)
    {
        return Uri.IsWellFormedUriString(url, UriKind.Absolute) && (url.StartsWith("http://") || url.StartsWith("https://"));
    }

    private async Task<string> GenerateUnusedShortcodeAsync()
    {
        int    length = 3;
        bool   exists;
        string shortcode;
        do
        {
            shortcode = IdGenerator.Generate(length);
            exists    = await _db.LinkExistsByShortcodeAsync(shortcode);
            length++;
        } while (exists);

        return shortcode;
    }
}
