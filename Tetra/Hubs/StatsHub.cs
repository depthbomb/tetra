using Microsoft.AspNetCore.SignalR;

using Tetra.Services;

namespace Tetra.Hubs;

public class StatsHub : Hub
{
    private readonly LinksService _links;

    public StatsHub(LinksService links)
    {
        _links = links;
    }

    [HubMethodName("RequestTotalShortlinks")]
    public async Task RequestTotalShortlinksAsync()
    {
        int linksCount = await _links.GetTotalCountAsync();

        await Clients.Caller.SendAsync("TotalShortlinks", linksCount, Context.ConnectionAborted);
    }
}
