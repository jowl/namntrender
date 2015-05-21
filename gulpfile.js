var gulp = require("gulp");
var pkg = require("./package.json");
var plug = require("gulp-load-plugins")();
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var del = require("del");

gulp.task("jshint", function () {
  return gulp.src(pkg.config.paths.main)
    .pipe(plug.jshint())
    .pipe(plug.jshint.reporter("jshint-stylish"));
});

gulp.task("bower", function() {
  return plug.bower();
});

gulp.task("views", function(){
  return gulp.src(pkg.config.paths.views)
    .pipe(gulp.dest(pkg.config.paths.public));
});

gulp.task("stylesheets", ["bower"], function(){
  return gulp.src([
    "bower_components/bootstrap/dist/css/bootstrap.css",
    "bower_components/ng-tags-input/ng-tags-input.css",
    "bower_components/ng-tags-input/ng-tags-input.bootstrap.css",
    pkg.config.paths.stylesheets
  ])
    .pipe(plug.size({showFiles: true}))
    .pipe(plug.concatCss("main.css"))
    .pipe(gulp.dest(pkg.config.paths.public + "/css"));
});

gulp.task("scripts", ["bower", "jshint"], function() {
  var bundler = browserify({entries: pkg.config.paths.main, debug: true});
  bundler.transform("debowerify");
  return bundler.bundle()
    .pipe(source(pkg.name + ".js"))
    .pipe(buffer())
    .pipe(plug.size({showFiles: true}))
    .pipe(plug.sourcemaps.init({loadMaps: true}))
    .pipe(plug.uglify())
    .pipe(plug.sourcemaps.write('./'))
    .pipe(plug.rename(function(path) { if (path.extname == '.js') path.extname = '.min.js'; }))
    .pipe(plug.size({showFiles: true}))
    .pipe(gulp.dest(pkg.config.paths.public + "/js"))
});

gulp.task('watch', function() {
  gulp.watch(pkg.config.paths.main, ['scripts']);
  gulp.watch(pkg.config.paths.stylesheets, ['stylesheets']);
  gulp.watch(pkg.config.paths.views, ['views']);
});

gulp.task('clean', function() {
  return del([pkg.config.paths.public + '/*'])
})

gulp.task('serve', plug.serve(pkg.config.paths.public));

gulp.task("default", ["stylesheets", "scripts", "views"]);