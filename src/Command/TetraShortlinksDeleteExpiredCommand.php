<?php namespace App\Command;

use App\Repository\ShortlinkRepository;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Zenstruck\ScheduleBundle\Schedule\Task\CommandTask;
use Zenstruck\ScheduleBundle\Schedule\SelfSchedulingCommand;

#[AsCommand(
    name: 'tetra:shortlinks:delete-expired',
    description: 'Deletes shortlink records that have expired',
)]
class TetraShortlinksDeleteExpiredCommand extends Command implements SelfSchedulingCommand
{
    public function __construct(private readonly ShortlinkRepository $shortlinks)
    {
        parent::__construct();
    }

    public function schedule(CommandTask $task): void
    {
        $task->everyFiveMinutes();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->info('Deleting expired shortlinks...');

        $delete_count = $this->shortlinks->deleteExpired();
        if ($delete_count > 0)
        {
            $io->success("Deleted $delete_count expired shortlink(s)");
        }
        else
        {
            $io->success('No expired shortlinks to delete');
        }

        return Command::SUCCESS;
    }
}
