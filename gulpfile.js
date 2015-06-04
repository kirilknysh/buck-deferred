var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    wrap = require("gulp-wrap");

gulp.task('minify', function () {
    gulp.src('src/buck-deferred.js')
        .pipe(uglify())
        .pipe(rename('buck-deferred.min.js'))
        .pipe(gulp.dest('src'));
});

gulp.task('build', function () {
    gulp.src('src/buck-deferred.js')
        .pipe(wrap("/* buck-deferred v0.3.0 [Distributed under MIT license] */\n<%= contents %>"))
        .pipe(gulp.dest('build'))
        .pipe(uglify())
        .pipe(wrap("/* buck-deferred v0.3.0 [Distributed under MIT license] */\n<%= contents %>"))
        .pipe(rename('buck-deferred.min.js'))
        .pipe(gulp.dest('build'));
});