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
    protected $description = 'Deletes Link records that have expired';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        Link::where([
            ['expires_at', '!=', null],
            ['expires_at', '<=', now()],
        ])->delete();

        return Command::SUCCESS;
    }
}
