'use strict';




/* NODE MODULES
 * ========================================================================== */


// Base
var fs           = require('fs');
var glob         = require('glob');
var del          = require('del');
var path         = require('path');

// Gulp
var gulp         = require('gulp');

// Utilities
var gutil        = require('gulp-util');
var filter       = require('gulp-filter');
var rename       = require('gulp-rename');
var concat       = require('gulp-concat');
var runSequence  = require('run-sequence');

// CSS/Sass
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// JavaScript
var babel        = require('gulp-babel');
var uglify       = require('gulp-uglify');
var eslint       = require('gulp-eslint');

// Handelbars
var hb           = require('gulp-hb');
var fm           = require('front-matter');
var gulpFm       = require('gulp-front-matter');

// Images
var imagemin     = require('gulp-imagemin');

// Browsersync
var browsersync  = require('browser-sync');




/* PATHS & CONFIGURATION
 * ========================================================================== */


// Base folders
var basePaths = {
  src:  'src/',
  dev:  'dev/',
  dist: 'dist/'
}


// Task specific folders
var paths = {
  // CSS
  css: {
    src:        basePaths.src  + 'css/',
    dev:        basePaths.dev  + 'css/',
    dist:       basePaths.dist + 'css/'
  },

  // JavaScript
  js: {
    src:        basePaths.src  + 'js/',
    dev:        basePaths.dev  + 'js/',
    dist:       basePaths.dist + 'js/'
  },

  // HTML
  html: {
    src:        basePaths.src  + 'html/',
    pages:      basePaths.src  + 'html/pages/',
    components: basePaths.src  + 'html/components/',
    partials:   basePaths.src  + 'html/partials/**/*.hbs',
    css:        basePaths.src  + 'html/css/',
    dev:        basePaths.dev,
    dist:       basePaths.dist
  },

  // Images
  img: {
    src:        basePaths.src  + 'img/',
    dev:        basePaths.dev  + 'img/',
    dist:       basePaths.dist + 'img/'
  }
}


// Config
var config = {
  // CSS
  css: {
    dev: {
      outputStyle: 'expanded'
    },
    dist: {
      outputStyle: 'compressed'
    },
    autoprefixer: {
      browsers: ['last 2 versions']
    }
  },

  // JavaScript
  js: {
    eslint: {
      extends: 'eslint:recommended',
      parserOptions: {
        ecmaVersion: 6
      },
      envs: ['browser'],
      rules: {
        // Best Practices
        'block-scoped-var': 'error',
        'curly': 'error',
        'eqeqeq': 'error',
        'no-alert': 'error',
        'no-empty-function': 'error',
        'no-extend-native': 'error',
        'no-floating-decimal': 'error',
        'no-loop-func': 'error',
        'no-native-reassign': 'error',
        'no-self-compare': 'error',
        'no-warning-comments': 'error',
        'yoda': 'error',

        // Variables
        'no-shadow': 'error',
        'no-shadow-restricted-names': 'error',
        'no-use-before-define': 'error',

        // Stylistic
        'array-bracket-spacing': 'error',
        'block-spacing': 'error',
        'camelcase': 'error',
        'comma-spacing': 'error',
        'computed-property-spacing': 'error',
        'key-spacing': 'error',
        'keyword-spacing': 'error',
        'no-bitwise': 'error',
        'no-mixed-operators': 'error',
        'no-spaced-func': 'error',
        'no-trailing-spaces': 'error',
        'no-unneeded-ternary': 'error',
        'no-whitespace-before-property': 'error',
        'object-property-newline': 'error',
        'semi': 'error',
        'semi-spacing': 'error',
        'space-before-blocks': 'error',
        'space-before-function-paren': ['error', 'never'],
        'space-in-parens': 'error',
        'space-infix-ops': 'error',
        'space-unary-ops': 'error'
      }
    },
    babel: {
      presets: ['es2015']
    }
  },

  // HTML
  html: {
    hb: {
      bustCache: true
    },
    browsersync: {
      server: {
        baseDir: paths.html.dev
      },
      logPrefix: 'Browsersync',
      scrollElements: ['*'],
      reloadDelay: 300,
      notify: {
        styles: {
          height: '40px',
          right: '40px',
          padding: '11px 16px',
          fontSize: '16px',
          fontWeight: '100',
          textTransform: 'uppercase',
          backgroundColor: 'rgb(47, 151, 255)',
          borderBottomLeftRadius: 'none'
        }
      }
    }
  },

  // Images
  img: {
    imagemin: [
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({plugins: [{removeUselessDefs: false}]})
    ]
  }
}




/* CLEAN
 * Delete directories
 * ========================================================================== */


// Clean Development
gulp.task('clean-dev', function() {
  return del(basePaths.dev);
});


// Clean Distribution
gulp.task('clean-dist', function() {
  return del(basePaths.dist);
});


// Clean Dev HTML
gulp.task('clean-html-dev', function() {
  return del(paths.html.dev + '**/*.html');
});


// Clean Dev Images
gulp.task('clean-img-dev', function() {
  return del(paths.img.dev + '**');
});




/* SASS
 * Compile Sass code into CSS
 * ========================================================================== */


// CSS Development
gulp.task('css-dev', function() {
  return gulp.src(paths.css.src + '**/*.scss')
    .pipe(sourcemaps.init())
      .pipe(sass(config.css.dev).on('error', sass.logError))
      .pipe(autoprefixer(config.css.autoprefixer))
      .pipe(rename('styles.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css.dev))
    .pipe(browsersync.stream({match: '**/*.css'}));
});


// CSS Watch
gulp.task('css-watch', ['css-dev']);


// CSS Styleguide
gulp.task('css-sg', function() {
  return gulp.src(paths.html.css + 'sg.scss')
    .pipe(sass(config.css.dev).on('error', sass.logError))
    .pipe(autoprefixer(config.css.autoprefixer))
    .pipe(gulp.dest(paths.css.dev));
});


// CSS Distribution
gulp.task('css-dist', ['clean-dist'], function() {
  return gulp.src(paths.css.src + '**/*.scss')
    .pipe(sass(config.css.dist).on('error', sass.logError))
    .pipe(autoprefixer(config.css.autoprefixer))
    .pipe(rename('styles.css'))
    .pipe(gulp.dest(paths.css.dist));
});




/* JAVASCRIPT
 * Lint javscript
 * ========================================================================== */


// Handle Bable error
var babelError = function(error) {
  console.log(
    '\n' + gutil.colors.underline(error.fileName) + '\n'
    + gutil.colors.gray('  line ' + error.loc.line + '  col ' + error.loc.column)
    + '  ' + gutil.colors.red('Babel error: ')
    + gutil.colors.blue(error.message.replace(error.fileName + ': ', '')) + '\n\n'
    + error.codeFrame + '\n'
  );
  this.emit('end');
};


// JavaScript Lint
gulp.task('js-lint', function() {
  return gulp.src([paths.js.src + 'functions/**/*.js', paths.js.src + 'components/**/*.js'])
    .pipe(eslint(config.js.eslint))
    .pipe(eslint.format());
});


// JavaScript Concatenation
gulp.task('js-process', function() {
  var excludeLibraries = filter([paths.js.src + 'functions/**/*.js', paths.js.src + 'components/**/*.js'], {restore: true});

  return gulp.src([paths.js.src + 'libraries/**/*.js', paths.js.src + 'functions/**/*.js', paths.js.src + 'components/**/*.js'])
    .pipe(sourcemaps.init())
      .pipe(excludeLibraries)
        .pipe(concat('scripts.js')) // Let Babel work on the concatenated files
        .pipe(babel(config.js.babel).on('error', babelError))
      .pipe(excludeLibraries.restore)
      .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.js.dev))
    .pipe(browsersync.stream({match: '**/*.js'}));
});


// JavaScript Development
gulp.task('js-dev', ['js-lint', 'js-process']);


// JavaScript Watch
gulp.task('js-watch', ['js-dev']);


// JavaScript Production
gulp.task('js-dist', ['clean-dist'], function() {
  var excludeLibraries = filter([paths.js.src + 'functions/**/*.js', paths.js.src + 'components/**/*.js'], {restore: true});

  return gulp.src([paths.js.src + 'libraries/**/*.js', paths.js.src + 'functions/**/*.js', paths.js.src + 'components/**/*.js'])
    .pipe(excludeLibraries)
      .pipe(concat('scripts.js')) // Let Babel work on the concatenated files
      .pipe(babel(config.js.babel))
    .pipe(excludeLibraries.restore)
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js.dist));
});




/* HTML
 * Pre-compile Handlebars files into HTML
 * ========================================================================== */


// Handle Handlebars error
var handlebarsError = function(error) {
  console.log(
    '\n' + gutil.colors.underline(error.fileName) + '\n'
    + '  ' + gutil.colors.red('Handlebars error: ')
    + gutil.colors.blue(error.message.replace(error.fileName + ': ', '')) + '\n'
  );
  this.emit('end');
};


// Handlebars Function
var compileHandlebars = function(source, destination, nav) {
  var pages      = [];
  var components = [];

  if (nav) {
    var pageList      = glob.sync(paths.html.pages      + '**/*.hbs');
    var componentList = glob.sync(paths.html.components + '**/*.hbs');

    for (var page of pageList) {
      var title = fm(fs.readFileSync(page, 'utf8')).attributes.title;
      var href  = path.relative(paths.html.pages, page).replace('.hbs', '.html');

      if (!title) {
        title = '(No Title)';
      }

      pages.push({title, href});
    }

    for (var component of componentList) {
      var title = fm(fs.readFileSync(component, 'utf8')).attributes.title;
      var href  = 'components/' + path.relative(paths.html.components, component).replace('.hbs', '.html');

      if (!title) {
        title = '(No Title)';
      }

      components.push({title, href});
    }
  }

  var hbStream = hb(config.html.hb)
    .partials(paths.html.partials)
    .helpers(require('handlebars-layouts'))
    .helpers({
      rel: function(options) {
        var currentPath = path.dirname(options.data.file.path);
        var sourcePath  = path.resolve(source);

        var additionalPath = '';

        if (source === paths.html.components) {
          additionalPath = '../'
        }

        if (currentPath === sourcePath) {
          return additionalPath;
        }

        return additionalPath + path.relative(currentPath, sourcePath) + '/';
      }
    })
    .data({
      displayNav: nav,
      navItems: {pages, components}
    });

  return gulp.src(source + '**/*.hbs')
    .pipe(gulpFm({property: 'meta'}))
    .pipe(hbStream.on('error', handlebarsError))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest(destination));
};


// HTML Development
gulp.task('html-dev', ['clean-html-dev'], function() {
  compileHandlebars(paths.html.pages, paths.html.dev, true);
  compileHandlebars(paths.html.components, paths.html.dev + 'components', true);
});


// HTML Watch
gulp.task('html-watch', ['html-dev'], browsersync.reload);


// HTML Production
gulp.task('html-dist', ['clean-dist'], function() {
  compileHandlebars(paths.html.pages, paths.html.dist, false);
});




/* Images
 * Copy images and compress production files
 * ========================================================================== */


// Images Development
gulp.task('img-dev', ['clean-img-dev'], function() {
  return gulp.src(paths.img.src + '**')
    .pipe(gulp.dest(paths.img.dev));
});


// Images Watch
gulp.task('img-watch', ['img-dev'], browsersync.reload);


// Images Distribution
gulp.task('img-dist', ['clean-dist'], function() {
  return gulp.src(paths.img.src + '**')
    .pipe(imagemin(config.img.imagemin))
    .pipe(gulp.dest(paths.img.dist));
});




/* Development
 * Generate development files.
 * ========================================================================== */


gulp.task('development', ['css-dev', 'js-dev', 'html-dev', 'img-dev']);




/* Production
 * Generate production ready files.
 * ========================================================================== */


gulp.task('production', ['css-dist', 'js-dist', 'html-dist', 'img-dist']);




/* DEFAULT
 * Run all dev tasks and watch for changes.
 * ========================================================================== */


gulp.task('browsersync', function() {
  browsersync(config.html.browsersync);
});


gulp.task('default', ['clean-dev'], function() {
  var onChangeMessage = function(event) {
    console.log('\n');
    gutil.log(gutil.colors.blue(event.path) + ' ' + event.type);
  }

  // Run initial task queue
  runSequence(['css-dev', 'css-sg', 'js-dev', 'html-dev', 'img-dev'], 'browsersync');

  // Watch CSS
  var watchCSS = gulp.watch(paths.css.src + '**/*.scss', ['css-watch']);
  watchCSS.on('change', onChangeMessage);

  // Watch JavaScript
  var watchJS = gulp.watch(paths.js.src + '**/*.js', ['js-watch']);
  watchJS.on('change', onChangeMessage);

  // Watch HTML
  var watchHTML = gulp.watch(paths.html.src + '**/*.hbs', ['html-watch']);
  watchHTML.on('change', onChangeMessage);

  // Watch Images
  var watchImg = gulp.watch(paths.img.src + '**/*', ['img-watch']);
  watchImg.on('change', onChangeMessage);
});
