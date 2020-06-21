const { series, src, dest, parallel } = require('gulp');
const csso = require('gulp-csso');
const shorthand = require('gulp-shorthand');
const clean = require('gulp-clean');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const nodemon = require('gulp-nodemon')
var browserSync = require('browser-sync').create();

const path =  {
    dist: 'dist/',
    src: 'resources/'
}

const environment =  {
    dev: 'development',
    prod: 'production'
}

// System config loading
var properties  = require('./config/app-config.json');
var httpPort    = properties.port.http;

function cleanDir(){
    return src( path.dist +  '*', {read: false})
    .pipe(clean());
}

function css() {
    return src(path.src + 'css/*.css')
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(shorthand())
    .pipe(csso())
    .pipe(dest(path.dist + 'css/'))
}

function faviconImage() {
    return src(path.src + 'favicon/*.{png,svg}')
    .pipe(imagemin())
    .pipe(dest(path.dist + 'favicon/'))
}

function faviconFiles() {
    return src(path.src + 'favicon/*.{ico,xml,webmanifest}')
    .pipe(dest(path.dist + 'favicon/'))
}

function img() {
    return src(path.src + 'img/*.*')
    .pipe(imagemin())
    .pipe(dest(path.dist + 'img/'))
}

function js() {
    return src(path.src + 'js/**/*.js')
    .pipe(uglify())
    .pipe(dest(path.dist + 'js/'))
}

function pug() {
    return src(path.src + '**/*.pug')
    .pipe(dest(path.dist))
}

function serveProd(done) {
    const server = nodemon({
        script: 'app.js'
      , ext: 'js json'
      , ignore: ['node_modules/', 'dist/', 'resources/', 'gulpfile.js']
      , env: { 'NODE_ENV': environment.prod }
      });

      server.on('start', () => {
        done();
    });
}

function serveDev(done) {
    const STARTUP_TIMEOUT = 5000;
    const server = nodemon({
        script: 'app.js'
        , stdout: false
        , ext: 'js json'
        , ignore: ['node_modules/', 'dist/', 'resources/', 'gulpfile.js']
        , env: { 'NODE_ENV': environment.dev }
    });
    let starting = false;

    const onReady = () => {
        starting = false;
        done();
    };
    
    server.on('start', () => {
        starting = true;
        setTimeout(onReady, STARTUP_TIMEOUT);
    });
    
    server.on('stdout', (stdout) => {
        process.stdout.write(stdout); // pass the stdout through
        if (starting) {
          onReady();
        }
    });   
}

function startBrowserSync(done){
    browserSync.init({
      proxy: "http://localhost:" + httpPort,
      files: [path.src + "/**/*.*"],
      port: 7000,
    }, done);
}

const build = parallel(css,faviconImage,faviconFiles,img,js,pug);

exports.default = series(cleanDir, build, serveProd)
exports.dev = series(cleanDir, serveDev, startBrowserSync)
exports.clean = series(cleanDir)