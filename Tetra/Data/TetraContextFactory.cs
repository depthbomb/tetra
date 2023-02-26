using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore.Design;

namespace Tetra.Data;

public class TetraContextFactory : IDesignTimeDbContextFactory<TetraContext>
{
    public TetraContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
                     .AddJsonFile("tetra.json")
                     .Build();
        
        var host = config.GetValue<string>("Database:Host");
        var user = config.GetValue<string>("Database:User");
        var pass = config.GetValue<string>("Database:Pass");
        var name = config.GetValue<string>("Database:Name");

        var optionsBuilder = new DbContextOptionsBuilder<TetraContext>()
            .UseNpgsql($"Host={host};Username={user};Password={pass};Database={name}");

        return new TetraContext(optionsBuilder.Options);
    }
}
