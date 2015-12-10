;(function( win, $ ) {
    var $win           = $( win ),
        globalSticky   = [],
        defaultConfig  = {},
        replicateAttrs = [ 'margin', 'padding', 'width', 'height', 'float', 'display', 'position', 'top', 'left' ],
        prevScrollTop  = 0,
        prevScrollLeft = 0,

        VERTICAL       = 'vertical',
        HORIZONTAL     = 'horizontal'

    function Sticky( config ) {
        this.config = config
        this.$el    = $( config.el )
        this.rect   = {}
        this.state  = {
            hasHolder:           false,
            isVerticalFixed:     false,
            isHorizontalFixed:   false,
            isVerticalQualify:   true,
            isHorizontalQualify: true
        }

        this.init()
    }

    Sticky.prototype = {
        constructor: Sticky,

        init: function() {
            this
                .isQualify()
                .generateHolder()
                .computePosition()
        },

        isQualify: function() {
            var state  = this.state,
                el     = this.$el[ 0 ],
                styles = win.getComputedStyle( el )

            if ( styles.top == 'auto' && styles.bottom == 'auto' ) {
                state.isVerticalQualify = false
            }

            if ( styles.left == 'auto' && styles.right == 'auto' ) {
                state.isHorizontalQualify = false
            }

            return this
        },

        generateHolder: function() {
            var config       = this.config,
                state        = this.state,
                $el          = this.$el,
                $placeholder = $( '<x-faketag>' ),
                elStyle

            $el.css( {
                position: 'relative',
                top:      config.top + 'px',
                left:     config.left + 'px'
            } )

            elStyle = getComputedStyle( $el[ 0 ] )

            this.holderCSS = replicateAttrs.map( function( v ) {
                return v + ':' + elStyle[ v ]
            } ).join( ';' )

            $placeholder[ 0 ].style.cssText = this.holderCSS + ';display:none;'

            if ( !state.hasHolder ) {
                state.hasHolder = true
                $el.after( $placeholder )
            }

            this.$placeholder = $placeholder

            return this
        },

        //TODO
        computePosition: function() {
            var config         = this.config,
                rect           = this.rect,
                $el            = this.$el,
                elPos          = $el.position(),
                elOffset       = $el.offset(),
                height         = $el.height(),
                width          = $el.width(),
                $parent        = $el.parent(),
                parentPos      = $parent.position(),
                pTop           = parentPos.top,
                pLeft          = parentPos.left,
                pPaddingTop    = parseInt( $parent.css( 'padding-top' ) ),
                pPaddingLeft   = parseInt( $parent.css( 'padding-left' ) ),
                pPaddingBottom = parseInt( $parent.css( 'padding-bottom' ) ),
                pMarginTop     = parseInt( $parent.css( 'margin-top' ) ),
                pMarginLeft    = parseInt( $parent.css( 'margin-left' ) ),
                pMarginBottom  = parseInt( $parent.css( 'margin-bottom' ) ),
                bottom         = $el.css( 'bottom' ),
                right          = $el.css( 'right' ),
                top            = elPos.top,
                left           = elPos.left

            config.top  = config.top ? config.top : 0
            config.left = config.left ? config.left : 0

            rect.constraint = config

            pTop  = pTop - pPaddingTop - pMarginTop
            pLeft = pLeft - pPaddingLeft - pMarginLeft
            top   = pTop > top ? pTop : top
            left  = pLeft > left ? pLeft : left

            rect.offset = {
                top:    top,
                left:   left,
                bottom: top + $parent.height() - ( bottom == 'auto' ? 0 : bottom ) - pPaddingBottom - pMarginBottom - height,
                right:  left + $parent.width() - ( right == 'auto' ? 0 : right ) - pPaddingLeft - pMarginLeft - width
            }

            //TODO
            config.bottom = rect.offset.bottom
            config.right  = rect.offset.right

            rect.old = {
                left:   elOffset.left,
                top:    elOffset.top,
                bottom: bottom,
                right:  right
            }

            return this
        },

        check: function( scrollTop, scrollLeft, isVertical ) {
            var state = this.state,
                rect  = this.rect.offset

            if ( isVertical && state.isVerticalQualify ) {
                if ( scrollTop > rect.top && scrollTop < rect.bottom ) {
                    this.fixed( VERTICAL, scrollLeft, scrollTop )
                } else {
                    this.restore( VERTICAL, scrollTop )
                }
            }

            if ( !isVertical && state.isHorizontalQualify ) {
                if ( scrollLeft > rect.left && scrollLeft < rect.right ) {
                    this.fixed( HORIZONTAL, scrollTop, scrollLeft )
                } else {
                    this.restore( HORIZONTAL, scrollLeft )
                }
            }
        },

        fixed: function( dir, scrollVal, scrollTop ) {
            //console.log( 'fixed', dir, scrollTop )
            var $el            = this.$el,
                state          = this.state,
                rect           = this.rect,
                constraintRect = rect.constraint,
                old            = rect.old,
                difference

            //TODO
            if ( !state.isVerticalFixed && !state.isHorizontalFixed ) {
                $el.css( {
                    position: 'fixed',
                    width:    $el.width() - parseInt( $el.css( 'padding-left' ) ) - parseInt( $el.css( 'padding-right' ) ),
                    height:   $el.height() - parseInt( $el.css( 'padding-top' ) ) - parseInt( $el.css( 'padding-bottom' ) ),
                } )
            }

            if ( dir == VERTICAL ) {
                state.isVerticalFixed = true
                $el.css( 'top', constraintRect.top )

                if ( !state.isHorizontalFixed ) {
                    difference = old.left - scrollVal
                    $el.css( 'left', difference )
                }
            } else {
                state.isHorizontalFixed = true
                $el.css( 'left', constraintRect.left )

                if ( !state.isVerticalFixed ) {
                    difference = old.top - scrollVal
                    $el.css( 'top', difference )
                }
            }

            this.$placeholder.css( {
                visibility: 'visible',
                display:    'block'
            } )
        },

        restore: function( dir, scrollVal ) {
            //console.log( 'restore', dir )
            var $el     = this.$el,
                state   = this.state,
                oldRect = this.rect.old

            //TODO
            if ( dir == VERTICAL ) {
                state.isVerticalFixed = false
                $el.css( 'top', oldRect.top - scrollVal )
            } else {
                state.isHorizontalFixed = false
                $el.css( 'left', oldRect.left - scrollVal )
            }

            //TODO
            if ( !state.isVerticalFixed && !state.isHorizontalFixed ) {
                $el[ 0 ].style.cssText = this.holderCSS
                this.$placeholder.hide()
            }
        }
    }

    $.fn.sticky = function( config ) {
        //TODO
        config = config || {}

        this.each( function() {
            config.el = this
            globalSticky.push( new Sticky( config ) )
        } )

        console.log( globalSticky )
    }

    $win.on( 'scroll', function() {
        var scrollTop  = $win.scrollTop(),
            scrollLeft = $win.scrollLeft(),
            isVertical

        if ( !prevScrollTop ) {
            prevScrollTop = scrollTop
        }

        if ( !prevScrollLeft ) {
            prevScrollLeft = scrollLeft
        }

        if ( scrollLeft == prevScrollLeft ) {
            isVertical = true
        }

        if ( scrollTop == prevScrollTop ) {
            isVertical = false
        }

        prevScrollTop  = scrollTop
        prevScrollLeft = scrollLeft

        globalSticky.forEach( function( v ) {
            v.check( scrollTop, scrollLeft, isVertical )
        } )
    } )

}( window, $ ))
