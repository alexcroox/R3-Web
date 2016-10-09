<?php
/**
 * Model for handling mission shares, providing short URL redirects
 *
 * @author Titan
 **/

class Shares {

    private $_db;

    public static function Instance() {

        static $inst = null;

        if ($inst === null) {
            $inst = new Shares();
        }
        return $inst;
    }

    function __construct() {

        $this->_db = Database::Instance()->conn;
    }

    public function fetchShortUrl($url) {

        $query = $this->_db->prepare("
            INSERT INTO
                shares
                (url, shared)
            VALUES
                (:url, NOW())
        ");

        $query->execute(array('url' => $url));

        $shareId = $this->_db->lastInsertId();

        return WEB_PATH . '/share/' . $shareId;
    }

    public function getRedirect($shareId) {

        $query = $this->_db->prepare("
            SELECT * FROM
                shares
            WHERE
                shareId = :shareId
            LIMIT 1
        ");

        $query->execute(array('shareId' => $shareId));

        $share = $query->fetch();

        if($share) {

            $this->saveView($shareId);
            return $share->url;
        } else {
            return FALSE;
        }
    }

    private function saveView($shareId) {

        $query = $this->_db->prepare("
            UPDATE shares SET
                hits = hits + 1
            WHERE
                shareId = :shareId
            LIMIT 1
        ");

        $query->execute(array('shareId' => $shareId));
    }
}
