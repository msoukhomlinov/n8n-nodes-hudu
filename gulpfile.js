const { src, dest, series } = require('gulp');
const rename = require('gulp-rename');

// Copy icons to dist
function copyIcons() {
	return src('*.png')
		.pipe(dest('dist'));
}

// Copy credentials to dist
function copyCredentials() {
	return src('credentials/**/*')
		.pipe(dest('dist/credentials'));
}

// Copy node files to dist
function copyNodeFiles() {
	return src(['src/**/*', '!src/**/*.ts'])
		.pipe(dest('dist/'));
}

// Organize the build tasks
exports['build:icons'] = copyIcons;
exports['copy:files'] = series(copyCredentials, copyNodeFiles);
exports.default = series(copyIcons, copyCredentials, copyNodeFiles); 