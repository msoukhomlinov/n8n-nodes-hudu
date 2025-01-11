const gulp = require('gulp');
const clean = require('gulp-clean');

// Clean dist folder
function cleanDist() {
  return gulp.src('dist', { 
    read: false, 
    allowEmpty: true 
  })
  .pipe(clean());
}

// Copy credentials to dist
function copyCredentials() {
  return gulp.src('credentials/**/*')
    .pipe(gulp.dest('dist/credentials'));
}

// Copy node files to dist (including icons and supporting folders)
function copyNodeFiles() {
  return gulp.src('src/nodes/Hudu/**/*', { base: 'src' })
    .pipe(gulp.dest('dist'));
}

// Move compiled files to correct locations and cleanup
function moveCompiledFiles() {
  return gulp.src('dist/src/nodes/Hudu/**/*.{js,js.map,json}', { base: 'dist/src' })
    .pipe(gulp.dest('dist'))
    .on('end', () => {
      gulp.src('dist/src', { read: false, allowEmpty: true })
        .pipe(clean());
    });
}

// Organize the build tasks
exports['copy:files'] = gulp.series(copyCredentials, copyNodeFiles);
exports.cleanDist = cleanDist;
exports.move = moveCompiledFiles;
exports.default = gulp.series(cleanDist, copyCredentials, copyNodeFiles, moveCompiledFiles);
