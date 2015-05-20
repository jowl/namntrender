var gulp = require("gulp");
var pkg = require("./package.json");
var plug = require("gulp-load-plugins")();
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");

gulp.task("jshint", function () {
    return gulp.src(pkg.config.paths.main)
        .pipe(plug.jshint())
        .pipe(plug.jshint.reporter("jshint-stylish"));
});

gulp.task("views", function(){
    return gulp.src(pkg.config.paths.views)
        .pipe(gulp.dest(pkg.config.paths.public));
});

gulp.task("stylesheets", function(){
    return gulp.src([
        "node_modules/bootstrap/dist/css/bootstrap.css",
        "node_modules/ng-tags-input/build/ng-tags-input.css",
        "node_modules/ng-tags-input/build/ng-tags-input.bootstrap.css",
        pkg.config.paths.stylesheets
    ])
        .pipe(plug.size({showFiles: true}))
        .pipe(plug.concatCss("main.css"))
        .pipe(gulp.dest(pkg.config.paths.public + "/css"));
});

gulp.task('scripts', ["jshint"], function() {
    return browserify({entries: pkg.config.paths.main, debug: true}).bundle()
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

gulp.task("default", ["stylesheets", "scripts", "views"]);