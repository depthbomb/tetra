using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Tetra;

public static class Program
{
    public static async Task Main(string[] args)
    {
        using var host = Host.CreateDefaultBuilder(args)
                             .UseContentRoot(Directory.GetCurrentDirectory())
                             .ConfigureAppConfiguration(c => c.AddJsonFile("Tetra.json"))
                             .ConfigureWebHostDefaults(w => w.UseStartup<Startup>())
                             .Build();

        await using (var scope = host.Services.CreateAsyncScope())
        {
            var db                = scope.ServiceProvider.GetRequiredService<TetraContext>();
            var pendingMigrations = await db.Database.GetPendingMigrationsAsync();
            int migrationCount    = pendingMigrations.Count();
            if (migrationCount > 0)
            {
                Console.WriteLine("Running {0} migration(s)", migrationCount);
                await db.Database.MigrateAsync();
            }
        }
        
        await host.RunAsync();
    }
}
