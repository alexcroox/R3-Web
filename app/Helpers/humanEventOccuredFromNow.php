<?php

use Carbon\Carbon;

if (!function_exists('humanEventOccuredFromNow')) {

    /**
     * Returns a human relative time difference from now
     *
     * @param \Carbon $sourceTime
     * @return string
     */
    function humanEventOccuredFromNow(Carbon $sourceTime)
    {
        $dateFormat = (config('app.us_date_format')) ? 'jS F Y' : 'm/d/Y';

        if ($sourceTime >= Carbon::parse("today 00:00")->setTimezone(config('app.timezone')))
            return $sourceTime->format('g:i A');
        elseif ($sourceTime >= Carbon::parse("yesterday 00:00")->setTimezone(config('app.timezone')))
            return "Yesterday at " . $sourceTime->format('g:i A');
        elseif ($sourceTime >= Carbon::parse("-6 day 00:00")->setTimezone(config('app.timezone')))
            return $sourceTime->format('l \\a\\t g:i A');
        else
            return $sourceTime->format($dateFormat);
    }
}
