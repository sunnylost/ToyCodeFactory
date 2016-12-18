'use strict'

let ESLint        = require( 'eslint' ),
    Child_Process = require( 'child_process' ),
    CLIEngine     = ESLint.CLIEngine

let cli = new CLIEngine( {
    allowInlineConfig: true,
    cache            : true,
    fix              : true,
    extensions       : [ '.js' ],
    ignorePattern    : 'node_modules/*'
} )

Child_Process.exec( 'git diff --cached --name-only', ( error, stdout ) => {
    if ( error ) {
        process.exitCode = 1
    } else {
        if ( stdout && ( stdout = stdout.trim() ) ) {
            let files = stdout
                .split( '\n' )
                .filter( ( file ) => file.endsWith( '.js' ) )

            if ( files.length ) {
                let report = cli.executeOnFiles( files ),
                    result = CLIEngine.getErrorResults( report.results ),
                    errors = ''

                if ( !result.length ) {
                    return
                }

                result.forEach( ( err ) => {
                    errors += `
文件: ${ err.filePath }`
                    err.messages.forEach( ( msg ) => {
                        errors += `
    错误内容: \u001b[31m${ msg.message }\u001b[39m
    出错代码: \u001b[32m${ msg.source }\u001b[39m
    在 ${ msg.line } 行, ${ msg.column } 列
`
                    } )
                } )
                /* eslint-disable */
                console.log( `
检测到 ${ result.length } 个错误: 
${ errors }
` )
                /* eslint-enable */
                //auto fix
                CLIEngine.outputFixes( report )
                return process.exitCode = 1
            }
        }
    }
} )
