using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

using Tetra.Hubs;

namespace Tetra.Extensions;

public static class EndpointRouteBuilderExtensions
{
    public static void MapTetraHubs(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHub<StatsHub>("/hubs/stats");
    }
}
