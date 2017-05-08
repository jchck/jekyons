var autoprefixer    = require('autoprefixer');
var browserSync     = require('browser-sync').create();
var reload          = browserSync.reload;
var mqpacker        = require('css-mqpacker');
var cssnano         = require('cssnano');
var gulp            = require('gulp');
var concat          = require('gulp-concat');
var jshint          = require('gulp-jshint');
var postcss         = require('gulp-postcss');
var shell           = require('gulp-shell');
var size            = require('gulp-size');
var sourcemaps      = require('gulp-sourcemaps');
var uglify 			= require('gulp-uglify');
var util 			= require('gulp-util');
var uncss           = require('gulp-uncss');
var watch           = require('gulp-watch');
var calc            = require('postcss-calc');
var color           = require('postcss-color-function');
var media           = require('postcss-custom-media');
var properties      = require('postcss-custom-properties');
var comments        = require('postcss-discard-comments');
var atImport        = require('postcss-import');
var nested          = require('postcss-nested');
var pump            = require('pump');

var input			= {
	'css': './css/jekyons.css',
	'js' : [
		'./js/*.js',
		'./js/scripts.js'
	]
}

var output			= {
	'css': './_site/css',
	'js' : './_site/js'
}

// Task for processing styles
gulp.task('css', function(){

	var processors 	= [
		atImport,
		media,
		nested,
		properties,
		calc,
		color,
		comments,
		autoprefixer,
		cssnano,
		mqpacker
	];

	return gulp.src(input.css)

		.pipe(postcss(processors))

		.pipe(size({
			gzip: true,
			showFiles: true,
			title: 'Size all gZippered up ->'
		}))

		.pipe(gulp.dest(output.css))

		.pipe(browserSync.stream())
});

// Task for removing unused styles from css (for production)
gulp.task('uncss', function() {

	return gulp.src('_site/css/jekyons.css')

		.pipe(uncss({
			html: ['_site/**/*.html']
		}))

		.pipe(size({
			gzip: true,
			showFiles: true,
			title: 'Size all uncssed ->'
		}))

		.pipe(gulp.dest(output.css))

		.pipe(browserSync.stream())
});

/*
	$ gulp js-concat
	$ gulp js-concat --type min
*/
gulp.task('js-concat', function(cb) {
	pump([
		gulp.src(input.js),
		sourcemaps.init(),
		concat('scripts.js'),
			util.env.type === 'min' ? uglify() : util.noop(),
		sourcemaps.write(),
		gulp.dest(output.js)
	], cb);
});

/*
	$ gulp js-hint
*/
gulp.task('js-hint', ['js-concat'], function() {
	return gulp.src(input.js)
		.pipe(jshint.extract('auto'))
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'))
});

/*
	$ gulp js
*/
gulp.task('js', ['js-hint', 'js-concat']);



// Task for building blog when something changed:
gulp.task('build', shell.task(['bundle exec jekyll build']));
// Or if you don't use bundle:
// gulp.task('build', shell.task(['jekyll build --watch']));

// Task for serving blog with Browsersync
gulp.task('serve', function() {

    browserSync.init({
    	server: {baseDir: '_site/'}
    });
});

// Task for reloading the browser
gulp.task('bs-reload', function(){

	browserSync.reload();
});

// Default gulp task
gulp.task('default', ['build', 'css', 'bs-reload', 'serve'], function() {
	gulp.watch('css/*', ['css']);
	gulp.watch(['*.html', './**/*.html'], ['bs-reload']);
});

// Production gulp task
gulp.task('production', ['build', 'css', 'uncss', 'bs-reload']);

