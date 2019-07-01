const gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  reload = browserSync.reload,
  path = require("path"),
  purgecss = require("gulp-purgecss"),
  postcss = require("gulp-postcss"),
  atimport = require("postcss-import"),
  tailwindcss = require("tailwindcss"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify"),
  cleanCSS = require("gulp-clean-css");

const tailwindConfig = path.resolve(__dirname, "tailwind.config.js");

const appUrl = path.join(__dirname, "app");

const srcPaths = {
  html: path.join(appUrl, "src"),
  css: path.join(appUrl, "src/css"),
  js: path.join(appUrl, "src/js")
};

const distPaths = {
  html: path.join(appUrl, "dist"),
  css: path.join(appUrl, "dist/css"),
  js: path.join(appUrl, "dist/js")
};

class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g);
  }
}
/*HTML*/
function html() {
  return gulp
    .src([srcPaths.html + "/**/*.html"])
    .pipe(gulp.dest(distPaths.html));
}
/*CSS*/
function css() {
  return gulp
    .src([srcPaths.css + "/**/*.css"])
    .pipe(postcss([atimport(), tailwindcss(tailwindConfig)]))
    .pipe(
      purgecss({
        content: [`${srcPaths.html}/**/*.html`],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html"]
          }
        ]
      })
    )
    .pipe(gulp.dest(distPaths.css))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(distPaths.css));
}

function javascript() {
  return gulp
    .src([srcPaths.js + "/**/*.js"])
    .pipe(gulp.dest(distPaths.js))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(distPaths.js));
}

/*Watching Files*/
function watch() {
  browserSync.init({
    open: "external",
    server: path.join(appUrl, "dist"),
    port: 8080
  });
  gulp.watch(srcPaths.html, gulp.series(html, css, javascript));
  gulp.watch(srcPaths.css, css);
  gulp.watch(srcPaths.js, javascript);
  gulp
    .watch([distPaths.css, distPaths.js, distPaths.html])
    .on("change", reload);
}

exports.watch = watch;
gulp.task("default", watch);
