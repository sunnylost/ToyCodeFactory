import VDOM from './vdom'

let html = VDOM.render( {
    tag:      'div',
    children: [ {
        tag:   'span',
        value: 'hello'
    }, {
        tag:      'p',
        chidlren: [ {
            tag:   'button',
            value: 'Click Me'
        } ]
    }, {
        tag:      'div',
        children: [ {
            tag:   'h2',
            value: 'Title'
        } ]
    } ]
} )

console.log( html )

document.body.innerHTML = html
