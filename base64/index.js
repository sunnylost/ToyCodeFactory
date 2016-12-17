var alphabet = Array.from( 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' ),
    pad      = '='

function convert( val ) {
    var padNum = [ 0, 2, 1 ][ val.length % 3 ],
        oct    = val.charCodeAt( 0 ) << 16 |
            ( val.length > 1 ? val.charCodeAt( 1 ) : '0' ) << 8 |
            ( val.length > 2 ? val.charCodeAt( 2 ) : '0' )

    return [
        alphabet[ oct >>> 18 ],
        alphabet[ oct >>> 12 & 63 ],
        padNum > 1 ? pad : alphabet[ oct >>> 6 & 63 ],
        padNum >= 1 ? pad : alphabet[ oct & 63 ]
    ].join( '' )
}

var btoa = ( val ) => {
    if ( typeof val !== 'string' ) {
        val = String( val )
    }

    if ( !val ) {
        return ''
    }

    return val.replace( /.{1,3}/g, convert )
}

console.log( btoa( 1 ) )
console.log( btoa( 'a' ) )
console.log( btoa( 'ab' ) )
console.log( btoa( '1a' ) )
console.log( btoa( '1ac' ) )
console.log( btoa( '1ace' ) )
