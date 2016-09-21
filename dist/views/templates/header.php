<!DOCTYPE html>
<html class="no-js" lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Si Racing">

    <title><?php echo $title . ' - ' . UNIT_NAME; ?></title>
    <meta name="description" content="">

    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/css/materialize.min.css">
    <link rel="stylesheet" href="<?php echo WEB_PATH; ?>/assets/app.css">

    <link rel="shortcut icon" href="<?php echo WEB_PATH; ?>/assets/images/branding/favicon.png">
</head>

<body class="page-<?php echo $page;?>">
    <div class="row">
        <nav>
            <div class="nav-wrapper">
                <div class="col s12">
                    <a href="#" class="brand-logo"><?php echo UNIT_NAME . ' Mission List'; ?></a>

                    <a href="#" data-activates="nav-mobile" class="button-collapse">
                        <i class="fa fa-bars" aria-hidden="true"></i>
                    </a>

                    <ul class="right hide-on-med-and-down">
                        <li class="active"><a href="<?php echo WEB_PATH; ?>">Mission List</a></li>
                        <li><a href="<?php echo WEB_PATH . '/admin'; ?>">Admin</a></li>
                    </ul>

                    <ul class="side-nav" id="nav-mobile">
                        <li><a href="sass.html">Sass</a></li>
                        <li><a href="badges.html">Components</a></li>
                        <li><a href="collapsible.html">Javascript</a></li>
                        <li><a href="mobile.html">Mobile</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    </div><!--/row-->

