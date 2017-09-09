<?php

use Carbon\Carbon;

if (!function_exists('getFactionData')) {

    /**
     * Returns data about a faction
     *
     * @param \Carbon $sourceTime
     * @return string
     */
    function getFactionData($factionId = -1)
    {
        $factionData = array(
            "name" => "unknown",
            "color" => '#CCCCCC'
        );

        $factionId = (int)$factionId;

        switch ($factionId) {

            case 0:

                $factionData['name'] = 'east';
                $factionData['color'] = '#ED5C66';
                break;

            case 1:

                $factionData['name'] = 'west';
                $factionData['color'] = '#2848E9';
                break;

            case 2:

                $factionData['name'] = 'independant';
                $factionData['color'] = '#518245';
                break;

            case 3:
                $factionData['name'] = 'civilian';
                $factionData['color'] = '#7D26CD';
                break;
        }

        return $factionData;
    }
}
