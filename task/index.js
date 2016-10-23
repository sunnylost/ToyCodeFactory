let EventEmitter = require( 'events' ).EventEmitter,
    isRunning    = Symbol( 'isRunning' ),
    isFinished   = Symbol( 'isFinished' )

class Task extends EventEmitter {
    constructor( context ) {
        super()
        this.context = context || {}
        this.count   = 0
    }

    add( tasks ) {
        if ( !tasks ) {
            throw Error( 'must provide an array or an object.' )
        }

        if ( this[ isFinished ] ) {
            return
        }

        let promises        = this.promises || [],
            context         = this.context,
            count           = this.count,
            result,
            generatePromise = ( key, index ) => {
                promises[ index || key ] = () => new Promise( ( resolve, reject ) => {
                    try {
                        tasks[ key ].call( context, ( data ) => {
                            result[ key ] = data
                            resolve()
                        } )
                    } catch ( err ) {
                        reject( err )
                    }
                } )
            }

        if ( Array.isArray( tasks ) ) {
            this.result = result = []

            for ( let i = 0; i < tasks.length; i++ ) {
                generatePromise( i, count++ )
            }

            this.count = count
        } else {
            this.result = result = {}

            for ( let key in tasks ) {
                generatePromise( key )
            }
        }

        this.promises = promises
    }

    run() {
        if ( this[ isRunning ] || this[ isFinished ] ) {
            return
        }

        this[ isRunning ] = true

        return Promise
            .all( this.promises.map( ( item ) => item() ) )
            .then( () => {
                console.log( 'hahah' )
                this[ isFinished ] = true
                this.emit( 'finish', this.result )
            } )
            .catch( () => {
                this.emit( 'error', this.result )
            } )
    }

    finish() {
        this[ isRunning ]  = false
        this[ isFinished ] = true
    }
}

module.exports = Task


//------------Test------------

var t = new Task( {
    name : 't',
    value: '12'
} )

t.on( 'finish', ( data ) => {
    console.log( 'finish: ', data )
} )

t.add( [ ( done ) => {
    setTimeout( () => {
        console.log( 5 )
        done( 1 )
    }, 100 )
}, ( done ) => {
    setTimeout( () => {
        console.log( 2 )
        done( 2 )
    }, 200 )
}, ( done ) => {
    setTimeout( () => {
        console.log( 3 )
        done( 3 )
    }, 300 )
} ] )

t.run()
