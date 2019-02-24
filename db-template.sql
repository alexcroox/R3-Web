CREATE TABLE `replays` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `missionName` VARCHAR(100) NULL DEFAULT NULL,
    `slug` VARCHAR(120) NULL DEFAULT NULL,
    `map` VARCHAR(50) NULL DEFAULT NULL,
    `dayTime` FLOAT NULL DEFAULT NULL,
    `playerCount` INT(11) NULL DEFAULT NULL,
    `playerList` TEXT NULL,
    `dateStarted` DATETIME NULL DEFAULT NULL,
    `lastEventMissionTime` DATETIME NULL DEFAULT NULL,
    `hidden` TINYINT(1) NULL DEFAULT '0',
    `addonVersion` VARCHAR(10) NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `id` (`id`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;


CREATE TABLE `events` (
    `replayId` INT(11) UNSIGNED NOT NULL,
    `playerId` VARCHAR(60) NULL DEFAULT NULL,
    `type` VARCHAR(50) NULL DEFAULT NULL,
    `value` LONGTEXT NULL,
    `missionTime` INT(11) NULL DEFAULT NULL,
    `added` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `replayId` (`replayId`),
    INDEX `missionTime` (`missionTime`),
    CONSTRAINT `FK_events_replays` FOREIGN KEY (`replayId`) REFERENCES `replays` (`id`) ON DELETE CASCADE
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;


CREATE TABLE `players` (
    `id` VARCHAR(60) NOT NULL DEFAULT '',
    `name` VARCHAR(50) NULL DEFAULT NULL,
    `lastSeen` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id` (`id`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;


CREATE TABLE `shares` (
    `shareId` INT(11) NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NULL DEFAULT NULL,
    `shared` DATETIME NULL DEFAULT NULL,
    `hits` INT(11) NULL DEFAULT '0',
    PRIMARY KEY (`shareId`)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
;
