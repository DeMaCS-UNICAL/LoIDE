const { series, src, dest, parallel } = require('gulp');
const csso = require('gulp-csso');
const shorthand = require('gulp-shorthand');
const clean = require('gulp-clean');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const gls = require('gulp-live-server');

const path =  {
    dest: 'dist/',
    src: 'resources/'
}

const environment =  {
    dev: 'development',
    prod: 'production'
}

function cleanDir(){
    return src( path.dest +  '*', {read: false})
    .pipe(clean());
}

function css() {
    return src(path.src + 'css/*.css')
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(shorthand())
    .pipe(csso())
    .pipe(dest(path.dest + 'css/'))
}

function faviconImage() {
    return src(path.src + 'favicon/*.{png,svg}')
    .pipe(imagemin())
    .pipe(dest(path.dest + 'favicon/'))
}

function faviconFiles() {
    return src(path.src + 'favicon/*.{ico,xml,webmanifest}')
    .pipe(dest(path.dest + 'favicon/'))
}

function img() {
    return src(path.src + 'img/*.*')
    .pipe(imagemin())
    .pipe(dest(path.dest + 'img/'))
}

function js() {
    return src(path.src + 'js/**/*.js')
    .pipe(uglify())
    .pipe(dest(path.dest + 'js/'))
}

function pug() {
    return src(path.src + '**/*.pug')
    .pipe(dest(path.dest))
}

function serveProd() {
    var server = gls('app.js', {env: {NODE_ENV: environment.prod}}, false);
    server.start();
}

function serveDev() {
    var server = gls('app.js', {env: {NODE_ENV: environment.dev}}, false);
    server.start();
}

const build = parallel(css,faviconImage,faviconFiles,img,js,pug);

exports.default = series(cleanDir, build, serveProd)
exports.dev = series(cleanDir, serveDev)
exports.clean = series(cleanDir)