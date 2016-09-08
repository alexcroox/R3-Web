<div class="row">
    <div class="mission-list">
        <div class="col s12">

            <?php if(isset($_GET['not-found'])): ?>
                <div class="card-panel red darken-1 grey-text text-lighten-5">
                    <i class="fa fa-exclamation fa-pad-right" aria-hidden="true"></i>
                    That mission cannot be found
                </div>
            <?php endif; ?>
            <table class="bordered">
                <thead>
                    <tr>
                        <th data-field="missing-name">Mission Name</th>
                        <th data-field="mission-map">Map</th>
                        <th data-field="mission-length">Length</th>
                        <th data-field="mission-date">Date Played</th>
                    </tr>
                </thead>

                <tbody>

                <?php foreach($replayList as $replay): ?>

                    <tr data-mission-id="<?php echo $replay->id; ?>">
                        <td class="mission-list__item__name">
                            <a class="text-link" href="<?php echo WEB_PATH . '/' . $replay->id . '/' . $replay->slug; ?>">
                                <?php echo strtoupper($replay->missionName); ?>
                            </a>
                        </td>

                        <td>
                            <?php echo strtoupper($replay->map); ?>
                        </td>

                        <td>
                            <?php echo $util->humanTimeDifference(strtotime($replay->lastEventTime), strtotime($replay->dateStarted)); ?>
                        </td>

                        <td>
                            <?php
                            $dateFormat = (US_DATE_FORMAT)? 'm/d/Y' : 'jS F Y';
                            echo date($dateFormat, strtotime($replay->dateStarted)); ?>
                        </td>
                    </tr>
                <?php endforeach; ?>

                </tbody>
            </table>
        </div><!--col-->
    </div><!--mission-list-->
</div><!--row-->
