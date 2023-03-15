using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using Tetra.Services;
using Tetra.Services.Hosted;
using Tetra.Services.Background;

namespace Tetra.Extensions;

public static class ServiceCollectionExtensions
{
    public static void AddTetraDb(this IServiceCollection services, IConfiguration config) =>
        services.AddDbContextPool<TetraContext>(options =>
        {
            var host = config.GetValue<string>("Database:Host");
            var user = config.GetValue<string>("Database:User");
            var pass = config.GetValue<string>("DB_PASSWORD") ?? config.GetValue<string>("Database:Pass");
            var name = config.GetValue<string>("Database:Name");

            options.UseNpgsql($"Host={host};Username={user};Password={pass};Database={name};Include Error Detail=true");
        });

    public static void AddTetraServices(this IServiceCollection services) =>
        services.AddSingleton<AuthService>()
                .AddSingleton<UserService>()
                .AddSingleton<AssetService>()
                .AddSingleton<LinksService>()
                .AddSingleton<QueueService>()
                .AddSingleton<HealthService>()
                .AddSingleton<ApiKeyService>()
                .AddSingleton<SecurityService>();

    public static void AddTetraBackgroundServices(this IServiceCollection services) => 
        services.AddHostedService<GitHubBackgroundService>()
                .AddHostedService<LinkCleanupBackgroundService>();
    
    public static void AddTetraHostedServices(this IServiceCollection services) => 
        services.AddHostedService<StartupHostedService>();
}
