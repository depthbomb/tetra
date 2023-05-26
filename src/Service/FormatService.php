<?php namespace App\Service;

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\Encoder\XmlEncoder;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\HttpKernel\Exception\HttpException;

class FormatService
{
    private const DEFAULT_FORMAT = 'json';
    private const OUTPUT_FORMATS = ['json', 'yaml', 'yml', 'xml', 'csv', 'php'];

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
            'json'        => 'application/json',
            'jsonp'       => 'text/javascript',
            'xml'         => 'application/xml',
            'yml', 'yaml' => 'text/yaml',
            'csv', 'php'  => 'text/plain'
        };

        $headers['Content-Type'] = $content_type;

        $serialized_data = match ($format)
        {
            'php'         => serialize($data),
            'yml', 'yaml' => Yaml::dump($data),
            'jsonp'       => $this->generateJsonpString($data),
            default       => $this->serializer->serialize($data, $format),
        };

        return new Response($serialized_data, $status_code, $headers);
    }

    private function determineFormat(): string
    {
        $request = $this->requestStack->getCurrentRequest();
        $queries = $request->query;
        if ($queries->has('jsonp') and !empty($queries->get('jsonp')))
        {
            return 'jsonp';
        }

        $format = strtolower($queries->get('format'));
        if (in_array($format, $this::OUTPUT_FORMATS))
        {
            if ($format === 'jsonp')
            {
                throw new HttpException(400, 'Please use the \'jsonp\' query parameter instead of \'format=jsonp\' when using JSONP format.');
            }

            return $format;
        }

        return $this::DEFAULT_FORMAT;
    }

    private function generateJsonpString(array $data): string
    {
        $function_name_pattern = '/^[a-zA-Z_$][a-zA-Z0-9_$]*$/';
        $request               = $this->requestStack->getCurrentRequest();
        $queries               = $request->query;
        $function_name         = $queries->get('jsonp');

        if (!preg_match($function_name_pattern, $function_name))
        {
            throw new HttpException(400, 'Invalid JSONP callback name');
        }

        $obj = json_encode($data);

        return "$function_name($obj);";
    }
}
