import gulp from "gulp";
import plumber from "gulp-plumber";
import sass from "gulp-dart-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import {create as bsCreate} from 'browser-sync';
import {deleteSync} from "del";
import htmlMin from "gulp-htmlmin";
import sourcemap from "gulp-sourcemaps";
import csso from "postcss-csso";
import rename from "gulp-rename";
import terser from "gulp-terser";
import imagemin from "gulp-imagemin";
import webp from "gulp-webp";
import svgstore from "gulp-svgstore";
import gulpAvif from "gulp-avif";
import pug from "gulp-pug";

const browser = bsCreate();

// Pug

export const interpretationPug = () => {
  return gulp.src("source/*.pug", {base: "source"})
    .pipe(pug({}))
    .pipe(gulp.dest("build"));
}

// Styles

export const styles = () => {
  return gulp.src("source/scss/styles.scss", {sourcemaps: true})
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest("build/css", {sourcemaps: '.'}))
    .pipe(browser.stream());
}

export const scripts = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(terser())
    .pipe(rename("main.min.js"))
    .pipe(gulp.dest("build/js", {sourcemap: '.'}))
    .pipe(browser.stream());
}
export const clean = async () => {
  return deleteSync("build");
}

export const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/favicon/*.{png,ico,webmanifest,svg}",
    "!source/images/icons/*.svg",
    "!source/pug",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

export const sprite = () => {
  return gulp.src("source/images/icons/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/images"))
}

export const server = (done) => {
  browser.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

export const reload = (done) => {
  browser.reload();
  done();
}

export const watcher = () => {
  gulp.watch("source/scss/**/*.scss", gulp.series(styles, reload));
  gulp.watch("source/js/*.js", gulp.series(scripts, reload));
  gulp.watch("source/pug/**/*.pug", gulp.series(interpretationPug, reload));
  gulp.watch("source/*.pug", gulp.series(interpretationPug, reload));
}

export default gulp.series(
  clean,
  // copy,
  gulp.parallel(
    interpretationPug,
    styles,
    scripts,
    // sprite,
  ),
  gulp.series(
    server,
    watcher
  )
);

