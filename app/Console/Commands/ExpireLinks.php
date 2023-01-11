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
    protected $signature = 'links:delete-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes Link records that have expired';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $num_deleted = Link::where([['expires_at', '!=', null], ['expires_at', '<=', now()]])
            ->limit(1000)
            ->delete();

        if ($num_deleted > 0)
        {
            $this->info("Deleted $num_deleted expired links");
        }

        return Command::SUCCESS;
    }
}
