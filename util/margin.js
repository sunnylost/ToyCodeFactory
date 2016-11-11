/**
 * 将一段字符串按照 css margin 的方式解析成对象
 *
 * 如果传入 px，默认忽略
 * 暂时不考虑百分比
 *
 * eg.
 *  input: '0px 5px 10px'
 *  output: {
 *      top: 0,
 *      right: 5,
 *      bottom: 10,
 *      left: 5
 *  }
 * @param str，待解析的字符串或数字
 */
var rpx = /px/g

exports.parse = function ( str ) {
    var originValue = str,
        iterateLen  = 4,
        result      = {
            top   : 0,
            right : 0,
            bottom: 0,
            left  : 0
        },
        type        = typeof str,
        marginArr, len

    if ( !str || type === 'object' || type === 'function' ) {
        return result
    }

    if ( type === 'number' ) {
        result.top = result.right = result.bottom = result.left = originValue
    } else {
        //remove px
        marginArr = String( originValue ).replace( rpx, '' ).split( ' ' )
        len       = marginArr.length

        if ( len === 0 || len > 4 ) {
            /* eslint-disable */
            return console.error( originValue + '\'s format is not right.' )
            /* eslint-enable */
        }

        while ( iterateLen-- ) {
            marginArr[ iterateLen ] = parseFloat( marginArr[ iterateLen ] ) || 0
        }

        switch ( len ) {
        case 1:
            result.top = result.right = result.bottom = result.left = marginArr[ 0 ]
            break

        case 2:
            result.top = result.bottom = marginArr[ 0 ]
            result.right = result.left = marginArr[ 1 ]
            break

        case 3:
            result.top   = marginArr[ 0 ]
            result.right = result.left = marginArr[ 1 ]
            result.bottom = marginArr[ 2 ]
            break

        case 4:
            result.top    = marginArr[ 0 ]
            result.right  = marginArr[ 1 ]
            result.bottom = marginArr[ 2 ]
            result.left   = marginArr[ 3 ]
            break
        }
    }

    return result
}
