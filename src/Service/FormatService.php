<?php namespace App\Service;

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\Encoder\XmlEncoder;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Encoder\JsonEncoder;

class FormatService
{
    private const DEFAULT_FORMAT = 'json';
    private const OUTPUT_FORMATS = ['json', 'js', 'yaml', 'yml', 'xml', 'csv', 'php'];

    private readonly Serializer $serializer;

    public function __construct(private readonly RequestStack $requestStack)
    {
        $encoders         = [new JsonEncoder, new XmlEncoder, new CsvEncoder];
        $this->serializer = new Serializer([], $encoders);
    }

    public function createFormattedResponse(mixed $data, int $status_code = 200, array $headers = []): Response
    {
        $format       = $this->determineFormat();
        $content_type = match ($format)
        {
            'json', 'js'  => 'application/json',
            'xml'         => 'application/xml',
            'yml', 'yaml' => 'text/yaml',
            'csv', 'php'  => 'text/plain'
        };

        $serialized_data = match ($format)
        {
            'php'         => serialize($data),
            'yml', 'yaml' => Yaml::dump($data),
            default       => $this->serializer->serialize($data, $format),
        };

        return new Response($serialized_data, $status_code, [
            ...$headers,
            'Content-Type' =>$content_type
        ]);
    }

    private function determineFormat(): string
    {
        $request = $this->requestStack->getCurrentRequest();
        $queries = $request->query;
        if ($queries->has('format'))
        {
            $format = strtolower($queries->get('format'));
            if (in_array($format, $this::OUTPUT_FORMATS))
            {
                if ($format === 'js')
                {
                    $format = self::DEFAULT_FORMAT;
                }

                return $format;
            }
        }

        return $this::DEFAULT_FORMAT;
    }
}
