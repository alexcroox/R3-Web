<?php
use Carbon\Carbon;

function humanRelativeTimeDifference(Carbon $time)
{
    $dateFormat = (env('R3_US_DATE_FORMAT', false)) ? 'jS F Y' : 'm/d/Y';

    if ($time >= Carbon::parse("today 00:00")->setTimezone(env('APP_TIMEZONE', 'UTC')))
        return $time->format('g:i A');
    elseif ($time >= Carbon::parse("yesterday 00:00")->setTimezone(env('APP_TIMEZONE', 'UTC')))
        return "Yesterday at " . $time->format('g:i A');
    elseif ($time >= Carbon::parse("-6 day 00:00")->setTimezone(env('APP_TIMEZONE', 'UTC')))
        return $time->format('l \\a\\t g:i A');
    else
        return $time->format($dateFormat);
}
