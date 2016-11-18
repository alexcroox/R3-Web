
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table events
# ------------------------------------------------------------

CREATE TABLE `events` (
  `replayId` int(11) unsigned NOT NULL,
  `playerId` varchar(60) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `value` longtext,
  `missionTime` int(11) DEFAULT NULL,
  `added` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  KEY `replayId` (`replayId`),
  KEY `missionTime` (`missionTime`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table players
# ------------------------------------------------------------

CREATE TABLE `players` (
  `id` varchar(60) NOT NULL DEFAULT '',
  `name` varchar(50) DEFAULT NULL,
  `lastSeen` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table replays
# ------------------------------------------------------------

CREATE TABLE `replays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `missionName` varchar(100) DEFAULT NULL,
  `slug` varchar(120) DEFAULT NULL,
  `map` varchar(50) DEFAULT NULL,
  `dayTime` float DEFAULT NULL,
  `playerCount` int(11) DEFAULT NULL,
  `playerList` text,
  `dateStarted` datetime DEFAULT NULL,
  `lastEventMissionTime` datetime DEFAULT NULL,
  `hidden` tinyint(1) DEFAULT '0',
  `addonVersion` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table shares
# ------------------------------------------------------------

CREATE TABLE `shares` (
  `shareId` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shared` datetime DEFAULT NULL,
  `hits` int(11) DEFAULT '0',
  PRIMARY KEY (`shareId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
