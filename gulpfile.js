var
    path = require('path'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    sequence = require('gulp-sequence'),
    gutil = require('gulp-util'),
    watchify = require('watchify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    stylus = require('gulp-stylus'),
    buffer = require('gulp-buffer'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    plumber = require('gulp-plumber'),
    rupture = require('rupture'),
    del = require('del'),
    inlineCss = require('gulp-inline-css'),
    concat = require('gulp-concat'),
    fs = require('fs'),
    paths = {};

paths.dist = './dist/assets';
paths.css = './assets-src/css';
paths.js = './assets-src/js';
paths.images = './assets-src/images';
paths.fonts = './assets-src/fonts';

gulp.task('js-third-party', function() {

    return gulp.src([
            paths.js + '/third-party/jquery.js',
            paths.js + '/third-party/*.js'
        ])
        .pipe(plumber())
        .pipe(concat('app-third-party.min.js'))
        .pipe(uglify())
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.dist))
});

gulp.task('js', function() {

    return gulp.src([
            '!' + paths.js + '/third-party/**/*',
            paths.js + '/lib/*.js',
            paths.js + '/*.js'
        ])
        .pipe(concat('app.js'))
        .pipe(plumber())
        .pipe(gulp.dest(paths.dist))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.dist));
});

gulp.task('css', function() {

    return gulp.src([
            paths.css + '/index.styl'
        ])
        .pipe(plumber())
        .pipe(stylus({
            'include css': true,
            paths: ['node_modules'],
            use: [rupture()]
        }))
        .pipe(autoprefixer(['last 2 versions', '> 2%']))
        .pipe(csso())
        .pipe(plumber.stop())
        .pipe(rename('app.css'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('images', function () {

    var imagemin = require('gulp-imagemin');
    var pngquant = require('imagemin-pngquant');

    return gulp.src(paths.images + '/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(paths.dist + '/images'));
});

gulp.task('fonts', function () {

    return gulp.src(paths.fonts + '/**/*')
        .pipe(gulp.dest(paths.dist + '/fonts'));
});

gulp.task('clean', function() {
    return del(path.join(paths.dist, '*'));
});

gulp.task('all', sequence('clean', ['css', 'js', 'js-third-party', 'images', 'fonts']));

// Run everything but watch it after too
gulp.task('default', ['all'], function() {

    gulp.watch([paths.css + '/**/*'], ['css']);
    gulp.watch(['!' + paths.js + 'third-party/*', paths.js + '/**/*'], ['js']);
    gulp.watch([paths.js + '/third-party/**/*'], ['js-third-party']);
    gulp.watch([paths.images + '/**/*'], ['images']);
});

// This is the same as the default task but it doesn't have any watchers
// which means it correctly exits when complete (used on deployment)
gulp.task('build', ['css', 'js', 'js-third-party', 'images', 'fonts'], function() {

    console.log('All built!');
});
