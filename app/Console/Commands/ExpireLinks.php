<?php namespace App\Console\Commands;

use App\Models\Link;
use Illuminate\Console\Command;

class ExpireLinks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'links:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes Link records that have expired (if set)';

    public function __construct(private Link $links)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $expired_links = $this->links->where([
            ['expires_at', '!=', null],
            ['expires_at', '<=', now()],
        ])->get();
        if ($expired_links->count() == 0)
        {
            $this->info('No expired links');
            return Command::SUCCESS;
        }

        $this->info("Expiring {$expired_links->count()} link(s)");
        foreach ($expired_links as $link)
        {
            if ($link->delete())
            {
                $this->info("Deleted link $link->id");
            }
            else
            {
                $this->error("Failed to delete link $link->id");
            }
        }

        return Command::SUCCESS;
    }
}
