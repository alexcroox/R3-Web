<?php
/**
 * Model for database handling
 *
 * @author Titan
 **/

class Database {

    public $conn;

    public static function Instance() {

        static $inst = null;

        if ($inst === null) {
            $inst = new Database();
        }
        return $inst;
    }

    private function __construct($host = DB_HOST, $name = DB_NAME, $user = DB_USER, $password = DB_PASSWORD) {

        // Create connection to db, setup some char encoding defaults for misconfigured servers
        $this->conn = new PDO("mysql:host=" . $host . ";dbname=" . $name, $user, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
        $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
    }
}
