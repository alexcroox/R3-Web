<div class="mission-list__tabs">
    <a href="#" class="mission-list__tab mission-list__tab--active" data-list="stats-terrains">Terrain stats</a>
</div>

<div class="container">
    <div class="mission-list mission-list--active" id="stats-terrains">

        <div class="mission-list__filters">
            <h3 class="mission-list__table-title">Terrains (<?php echo count($terrainStats); ?>)</h3>

            <div class="text-input--with-icon text-input--with-icon--unfocused">
                <i class="fa fa-search" aria-hidden="true"></i>
                <input class="terrain-list__search mission-list__search text-input" type="text" placeholder="Search terrains">
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="missions-list__sort missions-list__sort--asc" data-sort="stats-list__item__map">Terrain</th>
                    <th class="missions-list__sort missions-list__sort--asc" data-sort="stats-list__item__play-count">Play count</th>
                    <th class="missions-list__sort missions-list__sort--asc" data-sort="stats-list__item__last-played">Last played</th>
                </tr>
            </thead>

            <tbody class="list">

            <?php foreach($terrainStats as $terrain): ?>

                <tr>
                    <td>
                        <a class="text-link" target="_blank" href="https://titanmods.xyz/r3/tiler/render-test.php?terrain=<?php echo $terrain->map; ?>">
                            <span class="stats-list__item__map mission-list__item__name"><?php echo $terrain->map; ?></span>
                            <i class="fa fa-eye" aria-hidden="true"></i>
                        </a>
                    </td>

                    <td class="stats-list__item__play-count">
                        <?php echo $terrain->playCount; ?>
                    </td>

                    <td>
                        <span class="stats-list__item__last-played  mission-list--hide"><?php echo strtotime($terrain->lastPlayed); ?></span>
                        <?php echo $util->humanRelativeTimeDifference(strtotime($terrain->lastPlayed)); ?>
                    </td>
                </tr>
            <?php endforeach; ?>

            </tbody>
        </table>
    </div><!--/mission-list-->
</div><!--/container-->
