(function( global ) {
    var DOC   = global.document,
        DUMMY = DOC.createElement( 'div' )

    function Snowey() {
    }

    Snowey.prototype = {
        constructor: Snowey,

        setConfig: function( config ) {
            var el, snowflake, snowflakeEl, width, top, left,
                snowflakes = this.snowflakes = []

            el = this.el = DOC.querySelector( config.el )
            width = this.width = el.offsetWidth
            this.height = el.offsetHeight

            for ( var i = 0; i < 50; i++ ) {
                snowflakes.push( snowflake = new SnowFlake( this ) )
                el.appendChild( snowflakeEl = snowflake.el )
                top  = snowflake.top = 30
                left = snowflake.left = ( Math.random() * width ).toFixed( 4 )
                snowflakeEl.style.cssText = ( snowflake.intrinsicStyle += ';top:' + top + 'px;left:' + left + 'px;' )
            }

            return this
        },

        snowing: function() {
            var snowflake,
                snowflakes = this.snowflakes,
                len = snowflakes.length,
                i   = 0

            function frame( timestamp ) {
                for ( i = 0; i < len; i++ ) {
                    snowflake = snowflakes[ i ]
                    snowflake.fall( timestamp )
                }

                requestAnimationFrame( frame )
            }

            requestAnimationFrame( frame )

            return this
        }
    }

    function SnowFlake( context ) {
        this.context = context
        this.create()
    }

    SnowFlake.prototype = {
        constructor: SnowFlake,

        snowMould: '<i class="snowflake"></i>',

        borderRadius: [
            'border-top-left-radius:',
            'border-top-right-radius:',
            'border-bottom-left-radius:',
            'border-bottom-right-radius:'
        ],

        /**
         * init method, create irregular shaped snowflakes.
         */
        create: function() {
            var size, el,
                maxSize = 12,
                radius  = '',
                random  = +( Math.random() + .0001 ).toFixed( 4 )

            DUMMY.innerHTML = this.snowMould
            el = this.el = DUMMY.firstChild

            size = random * maxSize

            this.borderRadius.forEach( function( v ) {
                radius += v + ( 30 + Math.random() * 30 ).toFixed( 4 ) + '%;'
            })

            this.speed = this.context.height / ( 500 + 10000 * random)

            this.intrinsicStyle = 'opacity:' + random + ';' + radius +
                                  ';width:' + size + 'px;height:' +
                                  size + 'px;'

            this.startTime = 0
        },

        fall: function( timestamp ) {
            var left = this.left,
                top  = this.top

            this.startTime || ( this.startTime = timestamp )
            top = this.top = this.speed * ( timestamp - this.startTime )
            this.el.style.cssText = this.intrinsicStyle + ';transform:translate3d(' + left + 'px, ' + top + 'px, 0);'

            if ( top >= this.context.height ) {
                this.top = this.startTime = 0
            }
        }
    }

    global.Snowey = Snowey
})( this )