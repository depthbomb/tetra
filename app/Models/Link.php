<?php namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Link extends Model
{
    use HasUlids;
    use HasFactory;

    public function hasExpired(): bool
    {
        return !is_null($this->expires_at) AND $this->expires_at <= now();
    }

    public function shortLink(): string
    {
        return route('links.visit', ['shortcode' => $this->shortcode]);
    }
}
