using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Razor.TagHelpers;

using Tetra.Services;

namespace Tetra.TagHelpers;

[HtmlTargetElement("asset")]
public class AssetTagHelper : TagHelper
{
    [HtmlAttributeName("src")]
    public string SourceFileName { get; set; }

    private readonly IHttpContextAccessor _context;
    private readonly AssetService         _assets;

    public AssetTagHelper(IHttpContextAccessor context, AssetService assets)
    {
        _context = context;
        _assets  = assets;
    }

    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        var versionedFileUrl = await _assets.GetVersionedFileUrlAsync(SourceFileName);
        var nonce            = _context.HttpContext?.Items["CspNonce"] as string;
        var hashes           = await _assets.GetSriHashesAsync(SourceFileName);
        
        if (SourceFileName.EndsWith(".ts"))
        {
            output.TagName = "script";
            output.TagMode = TagMode.StartTagAndEndTag;
            output.Attributes.SetAttribute("src", versionedFileUrl);
            output.Attributes.SetAttribute("type", "module");
            output.Attributes.SetAttribute("nonce", nonce);
        }
        else
        {
            output.TagName = "link";
            output.TagMode = TagMode.StartTagOnly;
            output.Attributes.SetAttribute("href", versionedFileUrl);
            output.Attributes.SetAttribute("rel", "stylesheet");
            output.Attributes.SetAttribute("type", "text/css");
        }
        
        output.Attributes.SetAttribute("crossorigin", "anonymous");
        output.Attributes.SetAttribute("integrity", string.Join(' ', hashes));
    }
}
