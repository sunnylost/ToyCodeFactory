import VNode from './vnode'

let VDOM = {
    render( node ) {
        return new VNode( node ).render()
    }
}

export default VDOM
