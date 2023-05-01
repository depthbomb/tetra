<?php namespace App\Service;

use Symfony\Component\Serializer\Serializer;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\Encoder\XmlEncoder;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Encoder\JsonEncoder;

class FormatService
{
    private const DEFAULT_FORMAT = 'json';
    private const OUTPUT_FORMATS = ['json', 'xml', 'csv', 'php'];

    private readonly Serializer $serializer;

    public function __construct(private readonly RequestStack $requestStack)
    {
        $encoders         = [new JsonEncoder(), new XmlEncoder(), new CsvEncoder()];
        $this->serializer = new Serializer([], $encoders);
    }

    public function formatData(mixed $data, int $status_code = 200, array $headers = []): Response
    {
        $format       = $this->determineFormat();
        $content_type = match ($format)
        {
            'json'       => 'application/json',
            'xml'        => 'application/xml',
            'csv', 'php' => 'text/plain'
        };

        $headers['Content-Type'] = $content_type;

        if ($format === 'php')
        {
            $serialized_data = serialize($data);
        }
        else
        {
            $serialized_data = $this->serializer->serialize($data, $format);
        }

        return new Response($serialized_data, $status_code, $headers);
    }

    private function determineFormat(): string
    {
        $request = $this->requestStack->getCurrentRequest();
        $queries = $request->query;
        $format  = $queries->get('format');

        if (in_array($format, $this::OUTPUT_FORMATS))
        {
            return $format;
        }

        return $this::DEFAULT_FORMAT;
    }
}
