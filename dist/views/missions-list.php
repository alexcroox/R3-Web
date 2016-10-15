<div class="row">
    <div class="mission-list" id="replay-list">
        <div class="col s12">
            <div class="row">
                <div class="input-field col s12">
                    <i class="material-icons prefix">search</i>
                    <input id="mission-search" class="mission-list__search" type="text" />
                    <label for="mission-search">Search missions</label>
                </div>
            </div>

            <?php if(isset($_GET['not-found'])): ?>
                <div class="card-panel red darken-1 grey-text text-lighten-5">
                    <i class="fa fa-exclamation fa-pad-right" aria-hidden="true"></i>
                    That mission cannot be found
                </div>
            <?php endif; ?>
            <table class="bordered">
                <thead>
                    <tr>
                        <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__name">Mission Name</th>
                        <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__map">Map</th>
                        <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__length">Length</th>
                        <th class="mission-list__sort mission-list__sort--asc" data-sort="mission-list__item__date">Date Played</th>
                    </tr>
                </thead>

                <tbody class="list">

                <?php foreach($replayList as $replay): ?>

                    <tr data-mission-id="<?php echo $replay->id; ?>">
                        <td>
                            <a class="text-link mission-list__item__name" href="<?php echo WEB_PATH . '/' . $replay->id . '/' . $replay->slug; ?>">
                                <?php echo strtoupper($replay->missionName); ?>
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
                                Still in progress
                            <?php endif; ?>
                        </td>

                        <td>
                            <span class="mission-list__item__date mission-list--hide"><?php echo strtotime($replay->dateStarted); ?></span>
                            <?php echo $util->humanRelativeTimeDifference(strtotime($replay->dateStarted)); ?>
                        </td>
                    </tr>
                <?php endforeach; ?>

                </tbody>
            </table>
        </div><!--col-->
    </div><!--mission-list-->
</div><!--row-->
