var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('minify', function () {
    gulp.src('src/buck-deferred.js')
        .pipe(uglify())
        .pipe(rename('buck-deferred.min.js'))
        .pipe(gulp.dest('src'));
});

gulp.task('build', function () {
    gulp.src('src/buck-deferred.js')
        .pipe(gulp.dest('build'))
        .pipe(uglify())
        .pipe(rename('buck-deferred.min.js'))
        .pipe(gulp.dest('build'));
});