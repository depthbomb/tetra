using Microsoft.OpenApi.Models;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Tetra.Extensions;
using Tetra.Middleware;

namespace Tetra;

public class Startup
{
    private readonly IConfiguration _config;
    
    public Startup(IConfiguration config)
    {
        _config = config;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddTetraDb(_config);
        services.AddMemoryCache();
        services.AddTetraServices();
        services.AddTetraBackgroundServices();
        services.AddDataProtection();
        services.AddResponseCaching();
        services.AddControllersWithViews()
                .AddJsonOptions(o =>
                {
                    o.JsonSerializerOptions.WriteIndented = true;
                    o.JsonSerializerOptions.Encoder       = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
                });
        services.AddHealthChecks()
                .AddDbContextCheck<TetraContext>();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title       = "Tetra API",
                Version     = "v1",
                Description = "<p><strong>Note:</strong> all public API endpoints are ratelimited to two requests per second. Going over this limit will result in errors. You can see your current limits in the <code>X-RateLimit-*</code> response headers.</p><p style=\"margin-top:1rem;\"><a href=\"/\">Return to home</a></p>"
            });
            c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "Tetra.xml"));
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (!_config.GetValue<bool>("Production"))
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseStatusCodePagesWithReExecute("/error-handler-route/{0}");
            app.UseExceptionHandler("/error-handler-route/{0}");
            app.UseHsts();
            app.UseHttpsRedirection();
        }

        app.UseStaticFiles();
        app.UseResponseCaching();
        app.UseRouting();
        app.UseMiddleware<AuthMiddleware>();
        app.UseMiddleware<RequestIdMiddleware>();
        app.UseSwagger();
        app.UseHealthChecks("/health", new HealthCheckOptions
        {
            ResultStatusCodes =
            {
                [HealthStatus.Healthy] = 200,
                [HealthStatus.Degraded] = 200,
                [HealthStatus.Unhealthy] = 503,
            }
        });
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
