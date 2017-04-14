var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var livereload = require('gulp-livereload');
var server = require('gulp-develop-server');
var source = require('vinyl-source-stream');

gulp.task('default', ['build']);

var VARS = {
    css: {
        src: 'src/sass/**/*.scss',
        entry: 'src/sass/common.scss',
        dest: './static/'
    },
    js: {
        src: 'src/js/**/*.js',
        entry: 'src/js/index.js',
        dest: './static/',
        bundle: function(options) {
            var props = {
                entries: [VARS.js.entry],
                debug: false,//!!options.sourceMaps,
                cache: {},
                packageCache: {}
            };

            var bundler = options.watch ? watchify(browserify(props)) : browserify(props);
            bundler.transform(babelify, {
                presets: ['es2015', 'react'],
                plugins: ['transform-object-rest-spread', 'transform-runtime']
            });

            function rebundle() {
                return bundler.bundle()
                    .on('error', onJsBundleError)
                    .pipe(source('index.js'))
                    .pipe(gulp.dest(VARS.js.dest))
                    .pipe(livereload());
            }

            bundler.on('update', function() {
                gutil.log('Rebundling UI javascript...');
                rebundle();
            });

            return rebundle();
        }
    }
};

gulp.task('build', ['js', 'css']);

gulp.task('js', function() {
    return VARS.js.bundle({ sourceMaps: true })
});

gulp.task('css', function() {
    return gulp.src(VARS.css.entry)
        .pipe(sass({
            compiler: require('node-sass')
        }).on('error', sass.logError))
        .pipe(rename('main.css'))
        .pipe(gulp.dest(VARS.css.dest))
        .pipe(livereload());
});

gulp.task('watch:css', ['css'], function() {
    gulp.watch(VARS.css.src, ['css']);
});

gulp.task('watch:js', function() {
    return VARS.js.bundle({ watch: true, sourceMaps: true });
});

gulp.task('watch', [
    'watch:js',
    'watch:css'
]);

gulp.task('serve', ['watch'], function() {
    server.listen({ path: './server.js' });
    livereload.listen(35731);
});

function onJsBundleError() {
    var args = Array.prototype.slice.call(arguments);

    if (typeof args[0] === 'string') {
        args[0] = new Error(args[0]);
    }

    notify.onError({
        title: 'Scroll JS: Compile Error',
        message: '<%= error.message %>'
    }).apply(this, args);

    this.emit('end'); // Keep gulp from hanging on this task
}

module.exports = VARS;
