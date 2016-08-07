<div class="mission-list">

<?php foreach($viewData['replayList'] as $replay): ?>
    <div class="mission-list__item" data-mission-id="<?php echo $replay->id; ?>">
        <div class="mission-list__item__name">
            <a class="text-link" href="<?php echo WEB_PATH . '/' . $replay->id . '/' . $replay->slug; ?>">
                <?php echo $replay->missionName; ?>
            </a>
        </div>
    </div>
<?php endforeach; ?>

</div><!--mission-list-->
