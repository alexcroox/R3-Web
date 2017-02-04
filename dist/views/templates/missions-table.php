<div class="mission-list__filters">
    <h3 class="mission-list__table-title">Missions (<?php echo count($replayList); ?>)</h3>

    <div class="text-input--with-icon text-input--with-icon--unfocused">
        <i class="fa fa-search" aria-hidden="true"></i>
        <input class="<?php echo $tablePrefix; ?>-mission-list__search mission-list__search text-input" type="text" placeholder="Search missions">
    </div>
</div>

<table>
    <thead>
        <tr>
            <th class="<?php echo $tablePrefix; ?>-mission-list__sort mission-list__sort--asc" data-sort="<?php echo $tablePrefix; ?>-mission-list__item__name">Mission Name</th>
            <th class="<?php echo $tablePrefix; ?>-mission-list__sort mission-list__sort--asc" data-sort="<?php echo $tablePrefix; ?>-mission-list__item__map">Map</th>
            <th class="<?php echo $tablePrefix; ?>-mission-list__sort mission-list__sort--asc" data-sort="<?php echo $tablePrefix; ?>-mission-list__item__length">Length</th>
            <th class="<?php echo $tablePrefix; ?>-mission-list__sort mission-list__sort--asc" data-sort="<?php echo $tablePrefix; ?>-mission-list__item__player-count">Players</th>
            <th class="<?php echo $tablePrefix; ?>-mission-list__sort mission-list__sort--asc" data-sort="<?php echo $tablePrefix; ?>-mission-list__item__date">Date Played</th>
        </tr>
    </thead>

    <tbody class="<?php echo $tablePrefix; ?>-list">

    <?php foreach($replayList as $replay): ?>

        <tr data-mission-id="<?php echo $replay->id; ?>">
            <td>
                <a class="text-link <?php echo $tablePrefix; ?>-mission-list__item__name mission-list__item__name" href="<?php echo WEB_PATH . '/' . $replay->id . '/' . $replay->slug; ?>">
                    <?php echo $replay->missionName; ?>
                </a>
            </td>

            <td class="<?php echo $tablePrefix; ?>-mission-list__item__map mission-list__item__map">
                <?php echo strtoupper($replay->map); ?>
            </td>

            <td>
                <span class="<?php echo $tablePrefix; ?>-mission-list__item__length mission-list--hide"><?php echo (strtotime($replay->lastEventMissionTime) - strtotime($replay->dateStarted)); ?></span>
                <?php if($replay->lastEventMissionTime): ?>
                    <?php echo $util->humanTimeDifference(strtotime($replay->lastEventMissionTime), strtotime($replay->dateStarted)); ?>
                <?php else: ?>
                    <img width="11" class="mission-list__item__in-progress-icon" src="https://r3icons.titanmods.xyz/iconMan-civilian-trim.png"> In progress
                <?php endif; ?>
            </td>

            <td class="<?php echo $tablePrefix; ?>-mission-list__item__player-count -mission-list__item__player-count">
                <?php echo $replay->playerCount; ?>
            </td>

            <td>
                <span class="<?php echo $tablePrefix; ?>-mission-list__item__date mission-list--hide"><?php echo strtotime($replay->dateStarted); ?></span>
                <?php echo $util->humanRelativeTimeDifference(strtotime($replay->dateStarted)); ?>
            </td>
        </tr>
    <?php endforeach; ?>

    </tbody>
</table>
