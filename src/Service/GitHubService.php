<?php namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;

class GitHubService
{
    private const REPO_AUTHOR = 'depthbomb';
    private const REPO_NAME   = 'tetra';

    public function __construct(private readonly HttpClientInterface $http) {}

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function getLatestCommitHash(bool $short = true): string
    {
        $commits       = $this->getRepoCommits();
        $latest_commit = $commits[0];
        $commit_sha    = $latest_commit['sha'];

        if ($short)
        {
            return substr($commit_sha, 0, 7);
        }

        return $commit_sha;
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function getRepoCommits(): array
    {
        $url      = sprintf('https://api.github.com/repos/%s/%s/commits', self::REPO_AUTHOR, self::REPO_NAME);
        $response = $this->http->request('GET', $url);

        return $response->toArray();
    }
}
