<?php namespace App\Service;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Serializer\SerializerInterface;

class FormatService
{
    private const DEFAULT_FORMAT = 'json';

    private readonly array $outputFormats;

    public function __construct(
        private readonly SerializerInterface $serializer,
        private readonly RequestStack        $requestStack,
    )
    {
        $this->outputFormats = ['json', 'xml', 'csv', 'php'];
    }

    public function formatData(mixed $data, int $status_code = 200, array $headers = []): Response
    {
        $format       = $this->determineFormat();
        $content_type = match ($format)
        {
            'json' => 'application/json',
            'xml'  => 'application/xml',
            'csv'  => 'application/csv',
            'php'  => 'text/plain' // via serialize()
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

        if (in_array($format, $this->outputFormats))
        {
            return $format;
        }

        return $this::DEFAULT_FORMAT;
    }
}
