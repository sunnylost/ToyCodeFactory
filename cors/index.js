var http = require( 'http' )

const ALLOW_ORIGIN      = 'Access-Control-Allow-Origin',
      ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials',
      MAX_AGE           = 'Access-Control-Max-Age',
      REQUEST_METHOD    = 'access-control-request-method',
      REQUEST_HEADERS   = 'access-control-request-headers',
      ALLOW_HEADERS     = 'Access-Control-Allow-Headers',
      ALLOW_METHODS     = 'Access-Control-Allow-Methods',
      ORIGIN            = 'origin'

//http://www.html5rocks.com/static/images/cors_server_flowchart.png
http.createServer( ( req, res ) => {
    var headers = req.headers

    if ( headers[ ORIGIN ] ) {
        //preflight
        if ( req.method.toLowerCase() === 'options' && headers[ REQUEST_METHOD ] ) {
            res.setHeader( MAX_AGE, 1 ) //cache preflight
            res.setHeader( ALLOW_METHODS, headers[ REQUEST_METHOD ] )
            res.setHeader( ALLOW_ORIGIN, headers[ ORIGIN ] )
            res.setHeader( ALLOW_HEADERS, headers[ REQUEST_HEADERS ] )
            res.writeHead( 200 )
            return res.end()
        }

        res.setHeader( ALLOW_ORIGIN, 'http://localhost:63342' )
        //allow cookie
        res.setHeader( ALLOW_CREDENTIALS, 'true' )
    } else {
        console.log( 'Not valid' )
    }

    res.writeHead( 200 )
    res.write( JSON.stringify( {
        name: 'test',
        type: 'cors'
    } ) )
    res.end()
} ).listen( 8080 )
