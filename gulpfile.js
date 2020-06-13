const { series, src, dest, parallel } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const clean = require('gulp-clean');
const autoprefixer = require('gulp-autoprefixer');
let uglify = require('gulp-uglify-es').default;
const image = require('gulp-image');

const path =  {
    dest: 'dist/',
    src: 'resources/'
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
    .pipe(cleanCSS({debug: true}, (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
      }))
    .pipe(dest(path.dest + 'css/'))
}

function faviconImage() {
    return src(path.src + 'favicon/*.{png,svg,ico}')
    .pipe(image())
    .pipe(dest(path.dest + 'favicon/'))
}

function faviconFiles() {
    return src(path.src + 'favicon/*.{xml,webmanifest}')
    .pipe(dest(path.dest + 'favicon/'))
}

function img() {
    return src(path.src + 'img/*.*')
    .pipe(image())
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

function copyAll() {
    return src(path.src + '**/*.*')
    .pipe(dest(path.dest))
}

exports.default = series(cleanDir,parallel(css,faviconImage,faviconFiles,img,js,pug))
exports.dev = series(cleanDir,copyAll)
exports.clean = series(cleanDir)