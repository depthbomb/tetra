namespace Tetra.Events;

public class ShortlinkCreatedEventArgs : EventArgs
{
    public string Shortlink { get; }

    public ShortlinkCreatedEventArgs(string shortlink)
    {
        Shortlink = shortlink;
    }
}
