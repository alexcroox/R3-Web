<template>
    <table class="table-list">
        <thead>
            <tr>
                <th class="table-list__sort" data-sort="table-list__item__name">Mission Name</th>
                <th class="table-list__sort" data-sort="table-list__item__map">Map</th>
                <th class="table-list__sort" data-sort="table-list__item__length">Length</th>
                <th class="table-list__sort" data-sort="table-list__item__player-count">Players</th>
                <th class="table-list__sort" data-sort="table-list__item__date">Date Played</th>
            </tr>
        </thead>

        <tbody class="list">

        <?php foreach($replayList as $replay): ?>

            <tr data-mission-id="<?php echo $replay->id; ?>">
                <td>
                    <a class="text-link table-list__item__name table-list__item__name" href="<?php echo WEB_PATH . '/' . $replay->id . '/' . $replay->slug; ?>">
                        <?php echo $replay->missionName; ?>
                    </a>
                </td>

                <td class="table-list__item__map table-list__item__map">
                    <?php echo strtoupper($replay->map); ?>
                </td>

                <td>
                    <span class="table-list__item__length table-list--hide"><?php echo (strtotime($replay->lastEventMissionTime) - strtotime($replay->dateStarted)); ?></span>
                    <?php if($replay->lastEventMissionTime): ?>
                        <?php echo $util->humanTimeDifference(strtotime($replay->lastEventMissionTime), strtotime($replay->dateStarted)); ?>
                    <?php else: ?>
                        <img width="11" class="table-list__item__in-progress-icon" src="https://r3icons.titanmods.xyz/iconMan-civilian-trim.png"> In progress
                    <?php endif; ?>
                </td>

                <td class="table-list__item__player-count -table-list__item__player-count">
                    <?php echo $replay->playerCount; ?>
                </td>

                <td>
                    <span class="table-list__item__date table-list--hide"><?php echo strtotime($replay->dateStarted); ?></span>
                    <?php echo $util->humanRelativeTimeDifference(strtotime($replay->dateStarted)); ?>
                </td>
            </tr>
        <?php endforeach; ?>

        </tbody>
    </table>
</template>

<script>
    export default {

        props: ['data', 'headers']
    }
</script>

<style lang="stylus">
    @import '~styles/index.styl'


</style>
