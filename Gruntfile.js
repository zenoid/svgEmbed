module.exports = function( grunt ) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    svgembed: {

      build: {
        cwd: 'demo/styles',
        src: [ '*.css' ],
        dest: 'demo/build/',
        options: {
          flatten: true,
          includePath: 'demo/icons'
        }
      }

    },

  });

  grunt.loadTasks( 'tasks' );

};