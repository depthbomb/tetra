using System.Threading.Channels;

namespace Tetra.Services;

public class QueueService : IDisposable
{
    private readonly ILogger<QueueService>   _logger;
    private readonly Channel<Func<Task>>     _channel;
    private readonly CancellationTokenSource _cts;

    public QueueService(ILogger<QueueService> logger)
    {
        _logger  = logger;
        _channel = Channel.CreateUnbounded<Func<Task>>();
        _cts     = new CancellationTokenSource();
        
        Task.Run(ProcessQueueAsync, _cts.Token);
    }

    public async Task EnqueueAsync(Func<Task> func)
    {
        await _channel.Writer.WriteAsync(func);
    }
    
    public void Dispose()
    {
        _cts.Cancel();
    }

    private async Task ProcessQueueAsync()
    {
        while (!_cts.IsCancellationRequested)
        {
            var func = await _channel.Reader.ReadAsync(_cts.Token);
            try
            {
                await Task.Run(async () => await func());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing queue item");
            }
        }
    }
}
