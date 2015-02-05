module.exports = function( grunt ) {

  var path = require( 'path' ),
    newlineRegexp = /\r?\n/g,
    defaultRegexp = /%SVG-(\S+)%/,
    defaultExtension = '.svg',
    svgPrefix = "url('data:image/svg+xml;charset=utf-8,",
    svgPostfix = "')";

  grunt.registerMultiTask( 'svgembed', 'Embeds and URL-encodes SVG files', function() {

    var opts = this.options({
      silent: false,
      duplicates: true,
      includeRegexp: defaultRegexp,
      includePath: '',
      filenameExt: defaultExtension
    });

    if ( grunt.util.kindOf(opts.includeRegexp ) === 'string' ) {
      opts.includeRegexp = new RegExp( opts.includeRegexp );
    }

    this.files.forEach( function( f ) {
      var src,
        cwd = f.cwd;

      src = f.src.filter( function( p ) {
        if ( cwd ) {
          p = path.join( f.cwd, p );
        }

        if ( grunt.file.isFile( p ) ) {
          return true;
        } else {
          grunt.fail.fatal( '"' + p + '" is not a file' );
          return false;
        }
      });

      if ( src.length > 1 && isFilename( f.dest ) ) {
        grunt.fail.fatal( 'Source file cannot be more than one when dest is a file.' );
      }

      src.forEach( function( p ) {
        var fileName = f.flatten ? path.basename( p ) : p,
          outFile = isFilename( f.dest )? f.dest : path.join( f.dest, fileName );

        if ( cwd ) {
          p = path.join( cwd, p );
        }

        grunt.file.write( outFile, recurse( p, opts ) );

        if ( !opts.silent ) {
          grunt.log.oklns( 'Saved ' + outFile );
        }
      });

    });
  });

  function isFilename( p ) {
    return !!path.extname( p );
  }

  function newlineStyle( p ) {
    var matches = grunt.file.read( p ).match( newlineRegexp );
    return ( matches && matches[ 0 ] ) || grunt.util.linefeed;
  }

  function recurse( p, opts, included, indents ) {

    var src, next, match, error, content,
        newline, compiled, indent, fileLocation;

    if ( !grunt.file.isFile( p ) ) {
      grunt.fail.warn( 'Included file "' + p + '" not found.' );
      return 'Error including "' + p + '".';
    }

    indents = indents || '';
    newline = newlineStyle( p );
    included = included || [];

    if ( !opts.duplicates && ~included.indexOf( p ) ) {
      error = 'Duplicate include: ' + p + ' skipping.';
      grunt.log.error( error );
      return '';
    }

    included.push( p );

    src = grunt.file.read( p ).split( newline );

    compiled = src.map( function( line ) {
      match = line.match( opts.includeRegexp );

      if ( match ) {

        indent = match[ 1 ];
        fileLocation = match[ 2 ];

        if ( !fileLocation ) {
          fileLocation = indent;
          indent = '';
        }

        fileLocation = fileLocation + opts.filenameExt;
        next = path.join( ( opts.includePath || path.dirname( p ) ), fileLocation );
        content = recurse( next, opts, included, indents + indent );

        content = content.replace( /\$/g, '$$$$' );
        line = line.replace( opts.includeRegexp, svgPrefix + encodeURIComponent( content ) + svgPostfix );

      }

      return line && indents && !match ? indents + line : line;
    });

    return  compiled.join( newline );
  }
};
