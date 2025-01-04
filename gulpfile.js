const { src, dest, series } = require('gulp');
const rename = require('gulp-rename');
const fs = require('node:fs');
const path = require('node:path');

// Clean dist folder
function clean(cb) {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  cb();
}

// Copy credentials to dist
function copyCredentials() {
  return src('credentials/**/*').pipe(dest('dist/credentials'));
}

// Copy node files to dist (including icons and supporting folders)
function copyNodeFiles() {
  return src([
    'src/nodes/Hudu/**/*',
    'src/nodes/Hudu/descriptions/**/*',
    'src/nodes/Hudu/resources/**/*',
    'src/nodes/Hudu/utils/**/*'
  ]).pipe(dest('dist/nodes/Hudu'));
}

// Move compiled files to correct locations
function moveCompiledFiles(cb) {
  // Move main node file
  if (fs.existsSync('dist/src/nodes/Hudu/Hudu.node.js')) {
    fs.mkdirSync('dist/nodes/Hudu', { recursive: true });
    fs.renameSync('dist/src/nodes/Hudu/Hudu.node.js', 'dist/nodes/Hudu/Hudu.node.js');
    fs.renameSync('dist/src/nodes/Hudu/Hudu.node.js.map', 'dist/nodes/Hudu/Hudu.node.js.map');
  }

  // Move descriptions
  if (fs.existsSync('dist/src/nodes/Hudu/descriptions')) {
    fs.mkdirSync('dist/nodes/Hudu/descriptions', { recursive: true });
    fs.cpSync('dist/src/nodes/Hudu/descriptions', 'dist/nodes/Hudu/descriptions', { recursive: true });
  }

  // Move resources
  if (fs.existsSync('dist/src/nodes/Hudu/resources')) {
    fs.mkdirSync('dist/nodes/Hudu/resources', { recursive: true });
    fs.cpSync('dist/src/nodes/Hudu/resources', 'dist/nodes/Hudu/resources', { recursive: true });
  }

  // Move utils
  if (fs.existsSync('dist/src/nodes/Hudu/utils')) {
    fs.mkdirSync('dist/nodes/Hudu/utils', { recursive: true });
    fs.cpSync('dist/src/nodes/Hudu/utils', 'dist/nodes/Hudu/utils', { recursive: true });
  }
  
  // Clean up src directory in dist
  if (fs.existsSync('dist/src')) {
    fs.rmSync('dist/src', { recursive: true, force: true });
  }
  cb();
}

// Organize the build tasks
exports['copy:files'] = series(copyCredentials, copyNodeFiles);
exports.clean = clean;
exports.move = moveCompiledFiles;
exports.default = series(clean, copyCredentials, copyNodeFiles, moveCompiledFiles);
