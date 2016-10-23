<div class="mission-list__tabs">
    <a href="#" class="mission-list__tab mission-list__tab--active">All missions</a>
    <a href="#" class="mission-list__tab">My missions</a>
</div>

<div class="container">
    <div class="mission-list" id="replay-list">
        <div class="mission-list__filters">
            <h3 class="mission-list__table-title">Missions (<?php echo count($replayList); ?>)</h3>

            <div class="text-input--with-icon text-input--with-icon--unfocused">
                <i class="fa fa-search" aria-hidden="true"></i>
                <input class="mission-list__search text-input" type="text" placeholder="Search missions">
            </div>
        </div>

        <?php if(isset($_GET['not-found'])): ?>
            <div class="feedback feedback--error">
                <i class="fa fa-exclamation fa-pad-right" aria-hidden="true"></i>
                That mission cannot be found
            </div>
        <?php endif; ?>

        <table>
            <thead>
                <tr>
                    <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__name">Mission Name</th>
                    <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__map">Map</th>
                    <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__length">Length</th>
                    <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__player-count">Players</th>
                    <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__date">Date Played</th>
                </tr>
            </thead>

            <tbody class="list">

            <?php foreach($replayList as $replay): ?>

                <tr data-mission-id="<?php echo $replay->id; ?>">
                    <td>
                        <a class="text-link mission-list__item__name" href="<?php echo WEB_PATH . '/' . $replay->id . '/' . $replay->slug; ?>">
                            <?php echo $replay->missionName; ?>
                        </a>
                    </td>

                    <td class="mission-list__item__map">
                        <?php echo strtoupper($replay->map); ?>
                    </td>

                    <td>
                        <span class="mission-list__item__length mission-list--hide"><?php echo (strtotime($replay->lastEventMissionTime) - strtotime($replay->dateStarted)); ?></span>
                        <?php if($replay->lastEventMissionTime): ?>
                            <?php echo $util->humanTimeDifference(strtotime($replay->lastEventMissionTime), strtotime($replay->dateStarted)); ?>
                        <?php else: ?>
                            <img width="11" class="mission-list__item__in-progress-icon" src="<?php echo WEB_PATH . '/assets/images/map/markers/infantry/iconMan-civilian-trim.png'; ?>"> In progress
                        <?php endif; ?>
                    </td>

                    <td class="mission-list__item__player-count">
                        <?php echo $replay->playerCount; ?>
                    </td>

                    <td>
                        <span class="mission-list__item__date mission-list--hide"><?php echo strtotime($replay->dateStarted); ?></span>
                        <?php echo $util->humanRelativeTimeDifference(strtotime($replay->dateStarted)); ?>
                    </td>
                </tr>
            <?php endforeach; ?>

            </tbody>
        </table>
    </div><!--mission-list-->
</div><!--/container-->
