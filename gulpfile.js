var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('build', function () {
  gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});