var http = require( 'http' )

var server = http.createServer( ( req, res ) => {
    var headers = req.headers,
        method  = req.method || 'GET',
        hostes  = headers.host.split( ':' ),

        option  = {
            host: hostes[ 0 ],
            port: hostes[ 1 ] || 80,
            path: req.url,
            method,
            headers
        }

    var proxyReq = http.request( option, proxyRes => {
        res.writeHead( proxyRes.statusCode, proxyRes.headers )
        proxyRes.pipe( res )
    } )

    req.pipe( proxyReq )
} )

server.listen( 4000 )
