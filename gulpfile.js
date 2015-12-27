var gulp = require("gulp");
var pkg = require("./package.json");
var plug = require("gulp-load-plugins")();
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var del = require("del");
var autoprefixer = require("autoprefixer-core");

gulp.task("jshint", function () {
  return gulp.src([pkg.config.paths.scripts, '!**/*.coffee'])
    .pipe(plug.jshint())
    .pipe(plug.jshint.reporter("jshint-stylish"));
});

gulp.task("coffeelint", function() {
  return gulp.src([pkg.config.paths.scripts, '!**/*.js'])
    .pipe(plug.coffeelint())
    .pipe(plug.coffeelint.reporter());
});

gulp.task("lint", ["jshint", "coffeelint"]);

gulp.task("bower", function() {
  return plug.bower();
});

gulp.task("views", function(){
  return gulp.src(pkg.config.paths.views)
    .pipe(gulp.dest(pkg.config.paths.public));
});

gulp.task("stylesheets", ["bower"], function(){
  return gulp.src([
    "bower_components/ng-tags-input/ng-tags-input.css",
    pkg.config.paths.stylesheets
  ])
    .pipe(plug.size({showFiles: true}))
    .pipe(plug.sass())
    .pipe(plug.concatCss("main.css"))
    .pipe(plug.postcss([autoprefixer()]))
    .pipe(gulp.dest(pkg.config.paths.public + "/css"));
});

gulp.task("scripts", ["bower", "lint"], function() {
  var bundler = browserify({entries: pkg.config.paths.main, debug: true});
  bundler.transform("coffeeify");
  bundler.transform("debowerify");
  return bundler.bundle()
    .pipe(source(pkg.name + ".js"))
    .pipe(buffer())
    .pipe(plug.size({showFiles: true}))
    .pipe(plug.sourcemaps.init({loadMaps: true}))
    .pipe(plug.if(plug.util.env.production, plug.uglify()))
    .pipe(plug.sourcemaps.write('./'))
    .pipe(plug.rename(function(path) { if (path.extname == '.js') path.extname = '.min.js'; }))
    .pipe(plug.size({showFiles: true}))
    .pipe(gulp.dest(pkg.config.paths.public + "/js"));
});

gulp.task('watch', function() {
  gulp.watch(pkg.config.paths.scripts, ['scripts']);
  gulp.watch(pkg.config.paths.stylesheets, ['stylesheets']);
  gulp.watch(pkg.config.paths.views, ['views']);
});

gulp.task('clean', function() {
  return del([pkg.config.paths.public + '/*']);
});

gulp.task('serve', plug.serve(pkg.config.paths.public));

gulp.task("default", ["stylesheets", "scripts", "views"]);