<?php namespace App\Command;

use App\Repository\UserRepository;
use Exception;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name       : 'tetra:users:regenerate-api-key',
    description: 'Regenerates a user\'s API key regardless of time restriction',
)]
class TetraUsersRegenerateApiKeyCommand extends Command
{
    public function __construct(private readonly UserRepository $users)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('user', InputArgument::REQUIRED, 'The username of the user to regenerate the API key for');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io       = new SymfonyStyle($input, $output);
        $username = trim($input->getArgument('user'));

        $user = $this->users->findOneBy(['username' => $username]);

        if (!$user)
        {
            $io->error("No user could be found by the username \"$username\"");

            return Command::FAILURE;
        }

        try
        {
            $user->regenerateApiKey();
            $this->users->save($user, true);
        }
        catch (Exception $e)
        {
            $io->error($e->getMessage());
            $io->error($e->getTraceAsString());

            return Command::FAILURE;
        }

        $io->success('Successfully regenerated user\'s API key!');

        return Command::SUCCESS;
    }
}
