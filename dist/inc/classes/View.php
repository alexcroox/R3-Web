<?php
/**
 * Simple model for displaying views
 *
 * @author Titan
 **/

class View {

    public static function Instance() {

        static $inst = null;

        if ($inst === null) {
            $inst = new View();
        }
        return $inst;
    }

    public function render($view, $viewData) {

        $viewPath = APP_PATH . '/views/' . $view . '.php';

        if(!file_exists($viewPath))
            throw new Exception('That view doesn\'t exist! ' . $viewPath);

        require_once(APP_PATH . '/views/templates/header.php');
        require_once($viewPath);
        require_once(APP_PATH . '/views/templates/footer.php');
    }
}
