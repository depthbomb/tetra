<?php namespace App\Enums;

use Carbon\Carbon;

enum LinkDuration
{
    case FIVE_MINUTES;
    case TEN_MINUTES;
    case ONE_HOUR;
    case ONE_DAY;
    case ONE_WEEK;
    case TWO_WEEKS;
    case ONE_MONTH;
    case SIX_MONTHS;
    case ONE_YEAR;

    /**
     * Returns a string representing the link duration.
     *
     * @return string
     */
    public function toString(): string
    {
        return match($this)
        {
            self::FIVE_MINUTES => '5m',
            self::TEN_MINUTES  => '10m',
            self::ONE_HOUR     => '1h',
            self::ONE_DAY      => '1d',
            self::ONE_WEEK     => '1w',
            self::TWO_WEEKS    => '2w',
            self::ONE_MONTH    => '1mo',
            self::SIX_MONTHS   => '6mo',
            self::ONE_YEAR     => '1y',
        };
    }

    /**
     * Returns a {@link Carbon} object representing the link duration.
     *
     * @return Carbon
     */
    public function toCarbon(): Carbon
    {
        $now = now();
        return match($this)
        {
            self::FIVE_MINUTES => $now->addMinutes(5),
            self::TEN_MINUTES  => $now->addMinutes(10),
            self::ONE_HOUR     => $now->addHour(),
            self::ONE_DAY      => $now->addDay(),
            self::ONE_WEEK     => $now->addWeek(),
            self::TWO_WEEKS    => $now->addWeeks(2),
            self::ONE_MONTH    => $now->addMonth(),
            self::SIX_MONTHS   => $now->addMonths(6),
            self::ONE_YEAR     => $now->addYear(),
        };
    }

    /**
     * Returns a Unix timestamp representing the link duration.
     *
     * @param bool $ms Whether the timestamp should have millisecond precision.
     *
     * @return int
     */
    public function toUnixTimestamp(bool $ms = false): int
    {
        $carbon = $this->toCarbon();
        return $ms ? $carbon->getTimestampMs() : $carbon->getTimestamp();
    }
}
