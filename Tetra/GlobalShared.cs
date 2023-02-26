namespace Tetra;

public static class GlobalShared
{
    public static readonly IDictionary<int, string> HttpStatusMessages = new Dictionary<int, string>
    {
        { 200, "OK" },
        { 201, "Created" },
        { 400, "Bad Request" },
        { 401, "Unauthorized" },
        { 403, "Forbidden" },
        { 404, "Not Found" },
        { 405, "Method Not Found" },
        { 410, "Gone" },
        { 412, "Precondition Failed" },
        { 415, "Unsupported Media Type" },
        { 422, "Unprocessable Entity" },
        { 428, "Precondition Required" },
        { 429, "Too Many Requests" },
        { 500, "Internal Server Error" },
        { 501, "Not Implemented" },
        { 503, "Service Unavailable" },
    };

    public static string GetAssemblyBuildDate()
    {
        #pragma warning disable IL3000
        string assLocation = Assembly.GetExecutingAssembly().Location;
        #pragma warning restore IL3000
        if (string.IsNullOrEmpty(assLocation))
        {
            assLocation = Path.Combine(AppContext.BaseDirectory, "Tetra.exe");
        }
        var buildDate = new FileInfo(assLocation).LastWriteTime;

        return buildDate.ToString("o");
    }
}
