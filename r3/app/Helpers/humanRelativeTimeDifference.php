<?php

use Carbon\Carbon;

if (!function_exists('humanRelativeTimeDifference')) {

    /**
     * Returns a human relative time difference
     *
     * @param \Datetime $value
     * @param string    $format
     * @param string    $timezone
     * @return string
     */
    function humanRelativeTimeDifference(Carbon $time)
    {
        $dateFormat = (config('app.us_date_format')) ? 'jS F Y' : 'm/d/Y';

        if ($time >= Carbon::parse("today 00:00")->setTimezone(config('app.timezone')))
            return $time->format('g:i A');
        elseif ($time >= Carbon::parse("yesterday 00:00")->setTimezone(config('app.timezone')))
            return "Yesterday at " . $time->format('g:i A');
        elseif ($time >= Carbon::parse("-6 day 00:00")->setTimezone(config('app.timezone')))
            return $time->format('l \\a\\t g:i A');
        else
            return $time->format($dateFormat);
    }
}
