<?php namespace App\Command;

use App\Entity\Shortlink;
use App\Service\SafeBrowsingService;
use App\Repository\ShortlinkRepository;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Zenstruck\ScheduleBundle\Schedule\Task\CommandTask;
use Zenstruck\ScheduleBundle\Schedule\SelfSchedulingCommand;

#[AsCommand(
    name: 'tetra:shortlinks:check-safety',
    description: 'Checks shortlink destinations with the Google Safe Browsing API and disables them if they are found to be potentially malicious',
)]
class TetraShortlinksCheckSafetyCommand extends Command implements SelfSchedulingCommand
{
    public function __construct(
        private readonly ShortlinkRepository $shortlinks,
        private readonly SafeBrowsingService $sb,
    )
    {
        parent::__construct();
    }

    public function schedule(CommandTask $task): void
    {
        $task->hourly();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        /** @var Shortlink[] $shortlinks */
        $shortlinks = $this->shortlinks->createQueryBuilder('s')
            ->leftJoin('s.creator', 'c')
            ->where('s.checked = false')
            ->andWhere('s.disabled = false')
            ->andWhere('s.creator IS NULL')
            ->getQuery()
            ->getResult();

        if (count($shortlinks) > 0)
        {
            foreach ($shortlinks as $shortlink)
            {
                $destination = $shortlink->getDestination();
                if ($this->sb->isThreat($destination))
                {
                    $shortlink->toggleDisabled();
                    $io->caution(sprintf('Destination %s is flagged as malicious, disabling', $destination));
                }
                else
                {
                    $io->writeln(sprintf('Destination <fg=yellow>%s</> seems safe', $destination));
                }

                $shortlink->toggleChecked();
                $this->shortlinks->save($shortlink, true);
            }

            $io->success(sprintf('Finished checking %d shortlinks!', count($shortlinks)));
        }
        else
        {
            $io->success('No shortlinks to check!');
        }

        return Command::SUCCESS;
    }
}
