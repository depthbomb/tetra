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
        _baseUrl = config.GetValue<string>("BaseUrl");
    }

    /// <inheritdoc cref="TetraContext.GetLinksCountAsync"/>
    public async Task<int> GetTotalCountAsync() => await _db.GetLinksCountAsync();

    /// <inheritdoc cref="TetraContext.GetLinkByShortcodeAsync"/>
    public async Task<Link> GetLinkByShortcodeAsync(string shortcode) => await _db.GetLinkByShortcodeAsync(shortcode);

    public async Task<Link> CreateLinkAsync(Guid userId, string creatorIp, string destination, DateTime? expiresAt = null)
    {
        var shortcode   = await GenerateUnusedShortcodeAsync();
        var deletionKey = IdGenerator.Generate(64);
        var link = new Link
        {
            CreatorIp   = creatorIp,
            Shortcode   = shortcode,
            Shortlink   = $"{_baseUrl}/{shortcode}",
            Destination = destination,
            DeletionKey = deletionKey,
            ExpiresAt   = expiresAt
        };

        var user = await _db.GetUserByIdAsync(userId);

        link.User   = user;
        link.UserId = user.Id;

        await _db.Links.AddAsync(link);
        await _db.SaveChangesAsync();
        await BroadcastTotalShortlinksAsync();
        
        return link;
    }

    public async Task<List<Link>> GetLinksByUserIdAsync(Guid userId)
    {
        var links = await _db.Links.Where(l => l.UserId == userId).ToListAsync();

        return links;
    }

    public async Task DeleteLinkAsync(string shortcode, string deletionKey)
    {
        var link = await _db.Links.FirstOrDefaultAsync(l => l.Shortcode == shortcode && l.DeletionKey == deletionKey);
        if (link != null)
        {
            _db.Links.Remove(link);
            await _db.SaveChangesAsync();
            await BroadcastTotalShortlinksAsync();
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

    private async Task BroadcastTotalShortlinksAsync()
    {
        int count = await GetTotalCountAsync();
        await _stats.Clients.All.SendAsync("TotalShortlinks", count);
    }
}
