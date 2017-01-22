<!DOCTYPE html>
<html class="no-js" lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="<?php UNIT_NAME . ' AAR' ?>">

    <title><?php echo $title . ' - ' . UNIT_NAME; ?></title>

    <?php if(isset($metaImage)): ?>

        <meta property="og:title" content="<?php echo $title . ' - ' . UNIT_NAME; ?>">
        <meta property="og:type" content="website">
        <meta property="og:image" content="<?php echo $metaImage ?>">
        <meta property="og:site_name" content="<?php echo UNIT_NAME?>">
        <meta property="og:url" content="<?php echo WEB_PATH . $_SERVER['REQUEST_URI']?>">
        <meta property="og:description" content="<?=$metaDescription?>">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="<?php echo $title . ' - ' . UNIT_NAME; ?>">
        <meta name="twitter:description" content="<?=$metaDescription?>">
        <meta name="twitter:image" content="<?php echo $metaImage ?>">
    <?php endif; ?>

    <meta name="description" content="<?php echo $metaDescription; ?>">

    <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,500,700" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo WEB_PATH; ?>/assets/app.css">

    <link rel="shortcut icon" href="<?php echo FAVICON; ?>">
</head>

<body class="page-<?php echo $page;?>">
    <header class="clearfix">
        <h1>
            <a href="<?php echo WEB_PATH ?>" class="brand-logo"><?php echo $headerTitle ?></a>
        </h1>

        <div class="header__right">
            <a href="<?php echo WEB_PATH . '/admin' ?>" class="header__right__item">
                <i class="fa fa-lock" aria-hidden="true"></i>
                Admin
            </a>

            <a href="#" class="header__right__item js-help">
                <i class="fa fa-question-circle" aria-hidden="true"></i>
                Help
            </a>
        </div>
    </header>

