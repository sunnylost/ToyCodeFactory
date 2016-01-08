class VNode {
    constructor( node ) {
        if ( typeof node == 'string' ) {
            this.isText = true
            this.tag    = node
        } else {
            this.tag      = node.tag
            this.children = node.children ? node.children.map( n => new VNode( n ) ) : null
        }
    }

    render() {
        if ( this.isText ) {
            return this.tag
        } else {
            let innerHTML = this.children ? this.children.map( n => n.render() ).join( '' ) : ''
            return `<${this.tag}>${innerHTML}<\/${this.tag}>`
        }
    }
}

export default VNode
