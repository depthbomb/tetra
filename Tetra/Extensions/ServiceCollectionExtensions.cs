using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using Tetra.Services;
using Tetra.Services.Background;

namespace Tetra.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTetraDb(this IServiceCollection services, IConfiguration config) =>
        services.AddDbContextPool<TetraContext>(options =>
        {
            var host = config.GetValue<string>("Database:Host");
            var user = config.GetValue<string>("Database:User");
            var pass = config.GetValue<string>("Database:Pass");
            var name = config.GetValue<string>("Database:Name");

            options.UseNpgsql($"Host={host};Username={user};Password={pass};Database={name};Include Error Detail=true");
        });

    public static IServiceCollection AddTetraServices(this IServiceCollection services) =>
        services.AddSingleton<AuthService>()
                .AddSingleton<UserService>()
                .AddSingleton<AssetService>()
                .AddSingleton<LinksService>()
                .AddSingleton<SecurityService>();

    public static IServiceCollection AddTetraBackgroundServices(this IServiceCollection services) => 
        services.AddHostedService<LinkCleanupBackgroundService>();
}
