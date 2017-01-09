
# Arma 3 After Action Replay *Web* Component

<p>
    <a href="https://github.com/alexcroox/R3-Web/releases/latest">
        <img src="https://img.shields.io/github/release/alexcroox/R3-Web.svg" alt="Project Version">
    </a>    
    
    <a href="https://raw.githubusercontent.com/alexcroox/R3-Web/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-red.svg" alt="Project License">
    </a>
</p>

Website component for the [game server side addon](https://github.com/alexcroox/R3)

Being built along side the [addon component](https://github.com/alexcroox/R3) and [automated tiler](https://titanmods.xyz/r3/tiler)

### Demo

An exact mirror of this repo [can be viewed here](https://titanmods.xyz/r3/ark/)

### Install

_Note:_ R3 is in heavy development, it's not setup for auto updating or completely bug free, but it's in a stable enough state for a first preview release.

1. Follow the step by step [instructions on the addon repo](https://github.com/alexcroox/R3) and ensure you have mission event data in your database
2. Download the [latest web release](https://github.com/alexcroox/R3-Web/releases/latest)
3. Rename `config.template.php` to `config.php`, pay close attention to `DB_*`, `WEB_PATH` and timezone configurations
4. Upload the files to your web server which matches the URL in `WEB_PATH` in `config.php`

### Adding new Terrains

R3 supports over [45 popular terrains](https://titanmods.xyz/r3/tiler). Just played a mission on a map that R3 doesn't yet support? Feel free to add it yourself and let every user of R3 benefit from it! Follow the [simple instructions here](https://github.com/alexcroox/R3-Web/wiki/Adding-new-terrains)

### Adding new vehicle icons

Is a modded vehicle using the vanilla map icon instead of the correct shape and outline for that mod? [Submit new vehicle icons here](https://titanmods.xyz/r3/tiler/icons), and every user of R3 will get access to it! [instructions here](https://github.com/alexcroox/R3-Web/wiki/Adding-new-icons)
