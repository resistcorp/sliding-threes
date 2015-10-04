'use-strict'
module.exports = function(grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required grunt tasks
  require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
  });
  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-postcss');

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };
  // configure the tasks
  grunt.initConfig({
    // Project settings
    config: config,

    copy: {
      build: {
        cwd: 'app',
        src: [ '**' ],
        dest: 'dist',
        expand: true
      },
      styles: {
        cwd: 'app',
        src: [ '<%= config.app %>/styles/{,*/}*.css' ],
        dest: 'dist',
        expand: true
      },
      publish: {
        cwd: 'dist',
        src: [ '**' ],
        dest: '../gh-pages/app',
        expand: true
      }
    },
    wiredep: {
      target: {
        src: 'app/index.html', // point to your HTML file.
        options: {
            cwd: '',
            dependencies: true,
            devDependencies: false,
            exclude: [],
            fileTypes: {},
            ignorePath: '',
            overrides: {}
        }
      }
    },
    wiredepCopy: {
      target: {
        options: {
          src: 'bower_components',
          dest: 'app\\lib',

          wiredep: {
            target: {
              src: 'app/index.html', // point to your HTML file.
              options: {
                  cwd: '',
                  dependencies: true,
                  devDependencies: false,
                  exclude: [],
                  fileTypes: {},
                  ignorePath: '',
                  overrides: {}
              }
            }
          }
        }
      }
    },
    postcss: {
      options: {
        map: true,
        processors: [
        require('pixrem')(), // add fallbacks for rem units
          // Add vendor prefixed styles
          require('autoprefixer')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
          })
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/styles/',
          src: '{,*/}*.css',
          dest: 'dist/styles/'
        }]
      }
    },

    replace: {
      afterWire: {
        src: ['app/index.html'],
        dest: ['app/index.html'],
        replacements: [{
          from: /"\.\.\/bower_components/g,                   // string replacement
          to: '"lib'
        }]
      }
    },
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= config.app %>/scripts/{,*/}*.js'],
        tasks: ['copy:build', 'browserSync:livereload']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      styles: {
        files: ['<%= config.app %>/styles/{,*/}*.css'],
        tasks: ['copy:build', "browserSync:livereload"]
      }
    },
    browserSync: {
      options: {
        notify: false,
        background: true
      },
      livereload: {
        options: {
          files: [
            '<%= config.app %>/{,*/}*.html',
            '.tmp/styles/{,*/}*.css',
            '<%= config.app %>/images/{,*/}*',
            '<%= config.app %>/scripts/{,*/}*.js',
            '.tmp/scripts/{,*/}*.js'
          ],
          port: 9000,
          server: {
            baseDir: ['.tmp', config.dist],
            routes: {
            }
          }
        }
      },
      test: {
        options: {
          port: 9001,
          open: false,
          logLevel: 'silent',
          host: 'localhost',
          server: {
            baseDir: ['.tmp', './test', config.app],
            routes: {
              '/bower_components': './bower_components'
            }
          }
        }
      },
      dist: {
        options: {
          background: false,
          server: '<%= config.dist %>'
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/bower_components/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      publish: {
        dot: true,
        cwd: 'dist',
        src: [  '../gh-pages/app*' ],
      },
      server: '.tmp'
    },

  });


  // define the tasks
  grunt.registerTask('serve', 'start the server and preview your app', function (target) {

    if (target === 'dist') {
      return grunt.task.run(['build', 'browserSync:dist']);
    }

    grunt.task.run([
      'clean:server',
      'build',
      'wiredepCopy',
      'browserSync:livereload',
      'watch'
    ]);
  });
  grunt.registerTask(
    'build', 
    'Compiles all of the assets and copies the files to the build directory.', 
    [ 
      'clean',
      'wiredepCopy',
      'replace:afterWire',
      'copy',
      'postcss:dist' ]
  );
  grunt.registerTask(
    'publish', 
    'Compiles all of the assets and copies the files to the build directory.', 
    [ 'build', 'copy:publish' ]
  );
  grunt.registerTask('default', "serve");

};