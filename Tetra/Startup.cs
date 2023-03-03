using Microsoft.OpenApi.Models;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

using Tetra.Extensions;
using Tetra.Middleware;
using WebMarkupMin.AspNetCore7;

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
        services.AddSignalR();
        services.AddMemoryCache();
        services.AddHttpContextAccessor();
        services.AddTetraServices();
        services.AddTetraBackgroundServices();
        services.AddDataProtection();
        services.AddResponseCaching();
        services.AddWebMarkupMin()
                .AddHtmlMinification(o =>
                {
                    o.MinificationSettings.RemoveRedundantAttributes         = true;
                    o.MinificationSettings.RemoveHttpProtocolFromAttributes  = true;
                    o.MinificationSettings.RemoveHttpsProtocolFromAttributes = true;
                });
        services.AddControllersWithViews()
                .AddJsonOptions(o =>
                {
                    o.JsonSerializerOptions.WriteIndented = true;
                    o.JsonSerializerOptions.Encoder       = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
                });
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
            // app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseHsts();
            app.UseHttpsRedirection();
        }
        
        app.UseStatusCodePagesWithRedirects("/error-handler-route?code={0}");
        app.UseExceptionHandler("/error-handler-route");

        app.UseStaticFiles();
        app.UseResponseCaching();
        app.UseRouting();
        app.UseMiddleware<AuthMiddleware>();
        app.UseMiddleware<RequestIdMiddleware>();
        app.UseSwagger();
        app.UseWebMarkupMin();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapTetraHubs();
        });
    }
}
