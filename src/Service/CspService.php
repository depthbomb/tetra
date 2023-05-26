<?php namespace App\Service;

use Exception;

class CspService
{
    private ?string $nonce = null;

    /**
     * @throws Exception
     */
    public function getNonce(): string
    {
        if (is_null($this->nonce))
        {
            $this->nonce = base64_encode(random_bytes(16));
        }

        return $this->nonce;
    }
}
