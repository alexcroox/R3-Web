<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('r3.unit_name') }}</title>

    <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,500,700" rel="stylesheet">
  </head>
  <body>

    <div id="app">
        <router-view></router-view>
    </div>

    <script>
        var settings = {
            apiBase: '{{ config('app.url') }}/api',
            mappingAliases: <?php echo $mappingAliases; ?>,
            locales: <?php echo $locales; ?>,

            <?php
            foreach($settings as $key => $value) {
                echo "'{$key}': '{$value}',";
            }
            ?>
        };
    </script>
    <script src="/build.js"></script>

  </body>
</html>
