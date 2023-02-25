using Microsoft.AspNetCore.Html;

namespace Tetra.ViewModels;

public record SpaViewModel
{
    public HtmlString ClientJs  { get; set; }
    public HtmlString ClientCss { get; set; }
    public string     CsrfToken { get; set; }
    public string     User      { get; set; }
}
