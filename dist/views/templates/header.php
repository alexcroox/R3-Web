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
    <link rel="stylesheet" href="<?php echo WEB_PATH; ?>/assets/app.css?<?php echo APP_VERSION ?>">

    <link rel="shortcut icon" href="<?php echo FAVICON; ?>">
</head>

<body class="page-<?php echo $page;?>">
    <header>
        <h1>
            <a href="#" class="brand-logo"><?php echo UNIT_NAME . ' Mission List'; ?></a>
        </h1>
    </header>

