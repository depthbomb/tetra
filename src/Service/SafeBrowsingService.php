<?php namespace App\Service;

use Exception;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class SafeBrowsingService
{
    private const BASE_URI = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

    private string $apiKey;

    public function __construct(private readonly HttpClientInterface $http)
    {
        $this->apiKey = $_ENV['GOOGLE_SAFE_BROWSING_KEY'];
    }

    /**
     * @throws Exception
     * @throws TransportExceptionInterface
     * @throws DecodingExceptionInterface
     */
    public function isThreat(string $url): bool
    {
        $payload  = $this->createPayload($url);
        $response = $this->http->request('POST', $this::BASE_URI, [
            'query' => ['key' => $this->apiKey],
            'json'  => $payload,
        ]);

        return count($response->toArray()) > 0;
    }

    private function createPayload(string $url): array
    {
        $threat_types   = ['THREAT_TYPE_UNSPECIFIED', 'MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'];
        $platform_types = ['ALL_PLATFORMS'];
        return [
            'client'     => [
                'clientId'      => 'tetrawebservice',
                'clientVersion' => '1.0.0',
            ],
            'threatInfo' => [
                'threatTypes'      => $threat_types,
                'platformTypes'    => $platform_types,
                'threatEntryTypes' => ['URL'],
                'threatEntries'    => [
                    ['url' => $url],
                ],
            ],
        ];
    }
}
