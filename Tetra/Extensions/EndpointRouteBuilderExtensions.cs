using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

using Tetra.Hubs;

namespace Tetra.Extensions;

public static class EndpointRouteBuilderExtensions
{
    public static HubEndpointConventionBuilder MapTetraHubs(this IEndpointRouteBuilder endpoints) => 
        endpoints.MapHub<StatsHub>(GlobalShared.StatsHubEndpoint);
}
