<?php

return [
    'error' => [
        'api_key'   => [
            'missing'     => 'Missing API key',
            'invalid'     => 'Invalid API key',
            'on_cooldown' => 'A new API key cannot be regenerated at this time. Please try again later.',
        ],
        'shortlink' => [
            'destination' => [
                'missing' => 'Missing destination',
                'invalid' => 'Invalid destination',
            ],
            'shortcode'   => [
                'invalid'     => 'Custom shortcode must be between 3 and 255 characters, and can only contain A-Z, 0-9, - and _ characters',
                'unavailable' => 'The provided shortcode is unavailable',
            ],
            'duration'    => [
                'missing'         => 'Missing duration',
                'invalid'         => 'Invalid duration',
                'past_or_present' => 'The provided duration must result in a future date',
                'too_short'       => 'The minimum duration is 5 minutes',
            ],
        ],
    ],
];
