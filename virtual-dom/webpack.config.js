var webpack    = require( 'webpack' ),
    Path       = require( 'path' ),
    ROOT_PATH  = Path.resolve( __dirname ),
    APP_PATH   = Path.resolve( ROOT_PATH, 'src' ),
    BUILD_PATH = Path.resolve( ROOT_PATH, 'build' )

module.exports = {
    entry:   APP_PATH,
    output:  {
        path:     BUILD_PATH,
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    module:  {
        loaders: [ {
            test:    /\.js?$/,
            loader:  'babel-loader',
            exclude: [ '/node_modules' ]
        } ]
    }
}
