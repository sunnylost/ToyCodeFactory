let test   = require( 'ava' ),
    Margin = require( './margin' ).parse

var generateMarginVal = ( args ) => {
    let [ top, right, bottom, left ] = args
    return { top, right, bottom, left }
}

test( 'parse number', ( t ) => {
    t.deepEqual( Margin( 0 ), generateMarginVal( [ 0, 0, 0, 0 ] ), 'only one number 0' )
    t.deepEqual( Margin( 10 ), generateMarginVal( [ 10, 10, 10, 10 ] ), 'only one number 10' )
    t.deepEqual( Margin( -5 ), generateMarginVal( [ -5, -5, -5, -5 ] ), 'less than 0' )
    t.deepEqual( Margin( 5.9 ), generateMarginVal( [ 5.9, 5.9, 5.9, 5.9 ] ), 'float' )
} )

test( 'parse string', ( t ) => {
    t.deepEqual( Margin( '5' ), generateMarginVal( [ 5, 5, 5, 5 ] ), 'string contains one item' )
    t.deepEqual( Margin( '5 3' ), generateMarginVal( [ 5, 3, 5, 3 ] ), 'string contains two items' )
    t.deepEqual( Margin( '8 40 3' ), generateMarginVal( [ 8, 40, 3, 40 ] ), 'string contains three items' )
    t.deepEqual( Margin( '4 2 3 60' ), generateMarginVal( [ 4, 2, 3, 60 ] ), 'string contains four items' )
} )

test( 'contain unit', ( t ) => {
    t.deepEqual( Margin( '5px' ), generateMarginVal( [ 5, 5, 5, 5 ] ), 'string contains one item' )
    t.deepEqual( Margin( '5px 3px' ), generateMarginVal( [ 5, 3, 5, 3 ] ), 'string contains two items' )
    t.deepEqual( Margin( '8px 40px 3px' ), generateMarginVal( [ 8, 40, 3, 40 ] ), 'string contains three items' )
    t.deepEqual( Margin( '4px 2px 3px 60px' ), generateMarginVal( [ 4, 2, 3, 60 ] ), 'string contains four items' )

    t.deepEqual( Margin( '5%' ), generateMarginVal( [ 5, 5, 5, 5 ] ), 'string contains one item' )
    t.deepEqual( Margin( '5rem 3em' ), generateMarginVal( [ 5, 3, 5, 3 ] ), 'string contains two items' )
    t.deepEqual( Margin( '-8 40px 3px' ), generateMarginVal( [ -8, 40, 3, 40 ] ), 'string contains three items' )
    t.deepEqual( Margin( '4px 2rem 3px 60cm' ), generateMarginVal( [ 4, 2, 3, 60 ] ), 'string contains four items' )
} )


test( 'other type', ( t ) => {
    t.deepEqual( Margin( {} ), generateMarginVal( [ 0, 0, 0, 0 ] ), 'object' )
    t.deepEqual( Margin( NaN ), generateMarginVal( [ 0, 0, 0, 0 ] ), 'NaN' )
    t.deepEqual( Margin( () => 1 ), generateMarginVal( [ 0, 0, 0, 0 ] ), 'function' )
    t.deepEqual( Margin( /123/ ), generateMarginVal( [ 0, 0, 0, 0 ] ), 'regexp' )
    t.deepEqual( Margin(), generateMarginVal( [ 0, 0, 0, 0 ] ), 'undefined' )
} )
