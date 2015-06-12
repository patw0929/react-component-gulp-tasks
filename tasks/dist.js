var babelify = require('babelify');
var browserify = require('browserify');
var del = require('del');
var gutil = require('gulp-util');
var less = require('gulp-less');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var shim = require('browserify-shim');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

module.exports = function (gulp, config) {
	gulp.task('clean:dist', function (done) {
		del([config.component.dist], done);
	});

	gulp.task('build:dist:scripts', function () {
		var standalone = browserify('./' + config.component.src + '/' + config.component.file, {
			standalone: config.component.name
		})
		.transform(babelify.configure({
			plugins: [require('babel-plugin-object-assign')]
		}))
		.transform(shim);

		config.component.dependencies.forEach(function (pkg) {
			standalone.exclude(pkg);
		});

		return standalone.bundle()
			.on('error', function (e) {
				gutil.log('Browserify Error', e);
			})
			.pipe(source(config.component.pkgName + '.js'))
			.pipe(gulp.dest(config.component.dist))
			.pipe(rename(config.component.pkgName + '.min.js'))
			.pipe(streamify(uglify()))
			.pipe(gulp.dest(config.component.dist));
	});

	var buildTasks = ['build:dist:scripts'];

  if (config.component.less && config.component.less.entry) {
    gulp.task('build:dist:less:css', ['clean:dist'], function () {
      return gulp.src(config.component.less.path + '/' + config.component.less.entry)
        .pipe(less())
        .pipe(gulp.dest('dist'));
    });
    buildTasks.push('build:dist:less:css');
  }

	if (config.component.sass && config.component.sass.entry) {
		gulp.task('build:dist:sass:css', ['clean:dist'], function () {
			return gulp.src(config.component.sass.path + '/' + config.component.sass.entry)
				.pipe(sass())
				.pipe(gulp.dest('dist'));
		});
		buildTasks.push('build:dist:sass:css');
	}

	gulp.task('build:dist', buildTasks);
};
