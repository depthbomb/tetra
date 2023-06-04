<?php namespace App\Command;

use Symfony\Component\Uid\Ulid;
use Nette\PhpGenerator\PhpNamespace;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[AsCommand(
    name: 'tetra:assets:generate-static-class',
    description: 'Generates the static asset service class based off of the manifest.json created at asset build',
)]
class TetraAssetsGenerateStaticClassCommand extends Command
{
    private readonly string $servicePath;
    private readonly string $rootPath;

    public function __construct(private readonly ParameterBagInterface $parameters)
    {
        $this->rootPath    = $this->parameters->get('kernel.project_dir');
        $this->servicePath = join(DIRECTORY_SEPARATOR, [$this->rootPath, 'src', 'Service', 'StaticService.php']);
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('delete-manifest', 'd', InputOption::VALUE_OPTIONAL, 'Whether to delete the manifest.json file after generating the service class', false);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->writeln('Looking for manifest.json...');

        $manifest_path = $this->getManifestPath();
        if (!file_exists($manifest_path))
        {
            $io->error("manifest.json not found at expected path: $manifest_path");
            return Command::FAILURE;
        }

        $io->writeln('Parsing manifest.json file...');

        $json = file_get_contents($manifest_path);
        $data = json_decode($json);

        /** @var string[] $preload */
        $preload = [];
        /** @var string[] $assets */
        $assets = [];
        /** @var string[] $js_entries */
        $js_entries = [];
        /** @var string[] $css_entries */
        $css_entries = [];

        foreach ($data as $original => $info)
        {
            $versioned = $info->file;
            $asset_uri = "/assets/$versioned";

            if (property_exists($info, 'src'))
            {
                $assets[basename($original)] = $asset_uri;
            }

            if (property_exists($info, 'isEntry') and $info->isEntry)
            {
                $js_entries[] = $asset_uri;

                if (property_exists($info, 'css'))
                {
                    foreach ($info->css as $css_file)
                    {
                        $css_entries[] = "/assets/$css_file";
                    }
                }

                if (property_exists($info, 'dynamicImports'))
                {
                    foreach ($info->dynamicImports as $preload_name)
                    {
                        $preload_file = $data->{$preload_name}->file;
                        $preload[]    = "/assets/$preload_file";
                    }
                }
            }
        }

        $io->writeln('Generating service class...');

        $preload_variable_name     = $this->generateName();
        $assets_variable_name      = $this->generateName();
        $js_entries_variable_name  = $this->generateName();
        $css_entries_variable_name = $this->generateName();

        $now = date_create_immutable();

        $namespace = new PhpNamespace('App\\Service');
        $namespace->addUse('DateTimeImmutable');

        $class = $namespace->addClass('StaticService');
        $class->setComment("This service is automatically generated on {$now->format('c')}. Please do not modify it directly.")
            ->setFinal();
        $class->addConstant($preload_variable_name, $preload)->setPrivate();
        $class->addConstant($assets_variable_name, $assets)->setPrivate();
        $class->addConstant($js_entries_variable_name, $js_entries)->setPrivate();
        $class->addConstant($css_entries_variable_name, $css_entries)->setPrivate();
        $class->addMethod('getGeneratedDate')
            ->setPublic()
            ->setComment("Returns the DateTimeImmutable that represents when this service class was generated\n\n@return DateTimeImmutable")
            ->setReturnType('DateTimeImmutable')
            ->setBody("return date_create_immutable('{$now->format('c')}');")
            ->setFinal();
        $class->addMethod('getPreloadAssets')
            ->setPublic()
            ->setComment("Returns an array of public asset paths that should be preloaded\n\n@return string[]")
            ->setReturnType('array')
            ->setBody("return \$this::$preload_variable_name;")
            ->setFinal();
        $class->addMethod('getVersionedAssets')
            ->setPublic()
            ->setComment("Returns an array of all public asset paths\n\n@return string[]")
            ->setReturnType('array')
            ->setBody("return \$this::$assets_variable_name;");
        $class->addMethod('getVersionedAsset')
            ->setPublic()
            ->setComment("Returns the public asset path of a file by its original name\n\n@param string \$original_name\n\n@return string|null")
            ->setBody("return \$this::$assets_variable_name".'[$original_name];')
            ->setFinal()
            ->setReturnType('?string')
            ->addParameter('original_name')->setType('string');
        $class->addMethod('getJsEntries')
            ->setPublic()
            ->setComment("Returns an array of public asset paths that are used as JavaScript entries\n\n@return string[]")
            ->setReturnType('array')
            ->setBody("return \$this::$js_entries_variable_name;")
            ->setFinal();
        $class->addMethod('getCssEntries')
            ->setPublic()
            ->setComment("Returns an array of public asset paths that are used as CSS entries\n\n@return string[]")
            ->setReturnType('array')
            ->setBody("return \$this::$css_entries_variable_name;")
            ->setFinal();

        $class = "<?php $namespace";

        file_put_contents($this->servicePath, $class);

        if ($input->getOption('delete-manifest'))
        {
            $io->writeln('Deleting manifest.json...');
            unlink($manifest_path);
        }

        $io->success('Generated service class from manifest!');

        return Command::SUCCESS;
    }

    private function getManifestPath(): string
    {
        $ds         = DIRECTORY_SEPARATOR;
        $public_dir = join($ds, [$this->rootPath, 'public', 'assets']);
        return join($ds, [$public_dir, 'manifest.json']);
    }

    private function generateName(): string
    {
        return '_'.Ulid::generate();
    }
}
