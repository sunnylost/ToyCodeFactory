import VDOM from './vdom'

let html = VDOM.render( {
    tag:      'div',
    children: [ {
        tag:      'span',
        children: [ 'hello' ]
    }, {
        tag:      'p',
        chidlren: [ {
            tag:      'button',
            children: [ 'Click Me' ]
        } ]
    }, {
        tag:      'div',
        children: [ {
            tag:      'h2',
            chidlren: [ 'Title' ]
        } ]
    } ]
} )

console.log( html )

document.body.innerHTML = html
