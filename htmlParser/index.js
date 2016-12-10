(function ( g ) {
    //preprocessor
    //https://html.spec.whatwg.org/multipage/syntax.html#preprocessing-the-input-stream
    //parse state
    //https://html.spec.whatwg.org/multipage/syntax.html#parse-state

    var risAscii          = /[a-zA-Z]/,
        risLowercaseAscii = /[a-z]/,
        risUppercaseAscii = /[A-Z]/,
        risDigit          = /[0-9]/,
        risHexDigits      = /[0-9a-fA-F]/,
        risUpperHexDigits = /[0-9A-F]/,
        risLowerHexDigits = /[0-9a-f]/

    var STATE                 = {
            'data'                                    : 1,
            'RCDATA'                                  : 2,
            'RAWTEXT'                                 : 3,
            'scriptData'                              : 4,
            'PLAINTEXT'                               : 5,
            'tagOpen'                                 : 6,
            'endTagOpen'                              : 7,
            'tagName'                                 : 8,
            'RCDATALessThanSign'                      : 9,
            'RCDATAEndTagOpen'                        : 10,
            'RCDATAEndTagName'                        : 11,
            'RAWTEXTLessThanSign'                     : 12,
            'RAWTEXTEndTagOpen'                       : 13,
            'RAWTEXTEndTagName'                       : 14,
            'scriptDataLessThanSign'                  : 15,
            'scriptDataEndTagOpen'                    : 16,
            'scriptDataEndTagName'                    : 17,
            'scriptDataEscapeStart'                   : 18,
            'scriptDataEscapeStartDash'               : 19,
            'scriptDataEscaped'                       : 20,
            'scriptDataEscapedDash'                   : 21,
            'scriptDataEscapedDashDash'               : 22,
            'scriptDataEscapedLessThanSign'           : 23,
            'scriptDataEscapedEndTagOpen'             : 24,
            'scriptDataEscapedEndTagName'             : 25,
            'scriptDataDoubleEscapeStart'             : 26,
            'scriptDataDoubleEscaped'                 : 27,
            'scriptDataDoubleEscapedDash'             : 28,
            'scriptDataDoubleEscapedDashDash'         : 29,
            'scriptDataDoubleEscapedLessThanSign'     : 30,
            'scriptDataDoubleEscapeEnd'               : 31,
            'beforeAttributeName'                     : 32,
            'attributeName'                           : 33,
            'afterAttributeName'                      : 34,
            'beforeAttributeValue'                    : 35,
            'attributeValueDoubleQuoted'              : 36,
            'attributeValueSingleQuoted'              : 37,
            'attributeValueUnquoted'                  : 38,
            'afterAttributeValueQuoted'               : 39,
            'selfClosingStartTag'                     : 40,
            'bogusComment'                            : 41,
            'markupDeclarationOpen'                   : 42,
            'commentStart'                            : 43,
            'commentStartDash'                        : 44,
            'comment'                                 : 45,
            'commentLessThanSign'                     : 46,
            'commentLessThanSignBang'                 : 47,
            'commentLessThanSignBangDash'             : 48,
            'commentLessThanSignBangDashDash'         : 49,
            'commentEndDash'                          : 50,
            'commentEnd'                              : 51,
            'commentEndBang'                          : 52,
            'DOCTYPE'                                 : 53,
            'beforeDOCTYPEName'                       : 54,
            'DOCTYPEName'                             : 55,
            'afterDOCTYPEName'                        : 56,
            'afterDOCTYPEPublicKeyword'               : 57,
            'beforeDOCTYPEPublicIdentifier'           : 58,
            'DOCTYPEPublicIdentifierDoubleQuoted'     : 59,
            'DOCTYPEPublicIdentifierSingleQuoted'     : 60,
            'afterDOCTYPEPublicIdentifier'            : 61,
            'betweenDOCTYPEPublicAndSystemIdentifiers': 62,
            'afterDOCTYPESystemKeyword'               : 63,
            'beforeDOCTYPESystemIdentifier'           : 64,
            'DOCTYPESystemIdentifierDoubleQuoted'     : 65,
            'DOCTYPESystemIdentifierSingleQuoted'     : 66,
            'afterDOCTYPESystemIdentifier'            : 67,
            'bogusDOCTYPE'                            : 68,
            'CDATASection'                            : 69,
            'CDATASectionBracket'                     : 70,
            'CDATASectionEnd'                         : 71,
            'characterReference'                      : 72,
            'numericCharacterReference'               : 73,
            'hexademicalCharacterReferenceStart'      : 74,
            'decimalCharacterReferenceStart'          : 75,
            'hexademicalCharacterReference'           : 76,
            'decimalCharacterReference'               : 77,
            'numericCharacterReferenceEnd'            : 78,
            'characterReferenceEnd'                   : 79
        },
        TOKEN_TYPE            = {
            doctype  : 1,
            startTag : 2,
            endTag   : 3,
            comment  : 4,
            character: 5,
            eof      : 6
        },
        AMPERSAND             = '&',
        APOSTROPHE            = '\'',
        CHARACTER_TABULATION  = '\u0009',
        EQUALS                = '=',
        EXCLAMATION           = '!',
        FORM_FEED             = '\u000c',
        GRAVE_ACCENT          = '`',
        GREATER_THAN          = '>',
        HYPHEN_MINUS          = '-',
        LESS_THAN             = '<',
        LINE_FEED             = '\u000a',
        QUESTION              = '?',
        QUOTATION             = '"',
        LEFT_SQUARE_BRACKET   = '[',
        RIGHT_SQUARE_BRACKET  = ']',
        SEMICOLON             = ';',
        SOLIDUS               = '/',
        SPACE                 = '\u0020',
        NULL                  = '\u0000',
        REPLACEMENT_CHARACTER = '\ufffd',

        SMALL_X               = 'x',
        CAPITAL_X             = 'X',
        MISSING               = 'missing',
        ON                    = 'on',
        OFF                   = 'off',
        SCRIPT                = 'script'

    /**
     * Tokenization
     * https://html.spec.whatwg.org/multipage/syntax.html#tokenization
     */
    function tokenizer( src ) {
        var curState = STATE.data,
            i        = 0,
            len      = src.length,
            tokens   = [],
            characterReferenceCode,
            curTagToken,
            _lastStartTag,
            tempBuffer,
            curAttribute,
            returnState,
            nextChar

        while ( i < len ) {
            nextChar = src[ i++ ]

            switch ( curState ) {

                //https://html.spec.whatwg.org/multipage/syntax.html#data-state
            case STATE.data:
                if ( nextChar === AMPERSAND ) {
                    returnState = curState
                    curState    = STATE.characterReference
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.tagOpen
                } else {
                    //parse error and other
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#rcdata-state
            case STATE.RCDATA:
                if ( nextChar === AMPERSAND ) {
                    returnState = curState
                    curState    = STATE.characterReference
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.RCDATALessThanSign
                } else if ( nextChar === NULL ) {
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#rawtext-state
            case STATE.RAWTEXT:
                if ( nextChar === LESS_THAN ) {
                    curState = STATE.RAWTEXTLessThanSign
                } else if ( nextChar === NULL ) {
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-state
            case STATE.scriptData:
                if ( nextChar === LESS_THAN ) {
                    curState = STATE.scriptDataLessThanSign
                } else if ( nextChar === NULL ) {
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#plaintext-state
            case STATE.PLAINTEXT:
                emitCharToken( nextChar === NULL && REPLACEMENT_CHARACTER )
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#tag-open-state
            case STATE.tagOpen:
                if ( nextChar === EXCLAMATION ) {
                    curState = STATE.markupDeclarationOpen
                } else if ( nextChar === SOLIDUS ) {
                    curState = STATE.endTagOpen
                } else if ( risAscii.test( nextChar ) ) {
                    createTagToken( TOKEN_TYPE.startTag )
                    reconsume( STATE.tagName )
                } else if ( nextChar === QUESTION ) {
                    tokens.push( {
                        type : TOKEN_TYPE.comment,
                        value: ''
                    } )
                    curState = STATE.bogusComment
                } else {
                    emitCharToken( LESS_THAN )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#end-tag-open-state
            case STATE.endTagOpen:
                if ( risAscii.test( nextChar ) ) {
                    createTagToken( TOKEN_TYPE.endTag )
                    --i
                    curState = STATE.tagName
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                } else {
                    tokens.push( {
                        type : TOKEN_TYPE.comment,
                        value: ''
                    } )
                    curState = STATE.bogusComment
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#tag-name-state
            case STATE.tagName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.beforeAttributeName
                } else if ( nextChar === SOLIDUS ) {
                    curState = STATE.selfClosingStartTag
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar.toLowerCase()
                } else if ( nextChar === NULL ) {
                    curTagToken.tagName += REPLACEMENT_CHARACTER
                } else {
                    curTagToken.tagName += nextChar
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#rcdata-less-than-sign-state
            case STATE.RCDATALessThanSign:
                if ( nextChar === SOLIDUS ) {
                    tempBuffer = ''
                    curState   = STATE.RCDATAEndTagOpen
                } else {
                    emitCharToken( LESS_THAN )
                    reconsume( STATE.RCDATA )
                }
                break

            case STATE.RCDATAEndTagOpen:
                if ( risAscii.test( nextChar ) ) {
                    createTagToken( TOKEN_TYPE.endTag )
                    reconsume( STATE.RCDATAEndTagName )
                } else {
                    emitCharToken( LESS_THAN )
                    emitCharToken( SOLIDUS )
                    reconsume( STATE.RCDATA )
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#rcdata-end-tag-name-state
            case STATE.RCDATAEndTagName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.beforeAttributeName
                        break
                    }

                } else if ( nextChar === SOLIDUS ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.selfClosingStartTag
                        break
                    }
                } else if ( nextChar === GREATER_THAN ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.data
                        emitTagToken( curTagToken )
                        break
                    }
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar.toLowerCase()
                    tempBuffer += nextChar
                    break
                } else if ( risLowercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar
                    tempBuffer += nextChar
                    break
                }

                emitCharToken( LESS_THAN )
                emitCharToken( SOLIDUS )
                emitCharToken( tempBuffer )
                tempBuffer = '' //TODO:?
                reconsume( STATE.RCDATA )

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#rawtext-less-than-sign-state
            case STATE.RAWTEXTLessThanSign:
                if ( nextChar === SOLIDUS ) {
                    tempBuffer = ''
                    curState   = STATE.RAWTEXTEndTagOpen
                } else {
                    emitCharToken( LESS_THAN )
                    reconsume( STATE.RAWTEXT )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#rawtext-end-tag-open-state
            case STATE.RAWTEXTEndTagOpen:
                if ( risAscii.test( nextChar ) ) {
                    createTagToken( TOKEN_TYPE.endTag )
                    reconsume( STATE.RAWTEXTEndTagName )
                } else {
                    emitCharToken( LESS_THAN )
                    emitCharToken( SOLIDUS )
                    reconsume( STATE.RAWTEXT )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#rawtext-end-tag-name-state
            case STATE.RAWTEXTEndTagName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.beforeAttributeName
                        break
                    }

                } else if ( nextChar === SOLIDUS ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.selfClosingStartTag
                        break
                    }
                } else if ( nextChar === GREATER_THAN ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.data
                        emitTagToken( curTagToken )
                        break
                    }
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar.toLowerCase()
                    tempBuffer += nextChar
                    break
                } else if ( risLowercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar
                    tempBuffer += nextChar
                    break
                }


                emitCharToken( LESS_THAN )
                emitCharToken( SOLIDUS )
                emitCharToken( tempBuffer )
                tempBuffer = '' //TODO:?
                reconsume( STATE.RAWTEXT )

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-less-than-sign-state
            case STATE.scriptDataLessThanSign:
                if ( nextChar === SOLIDUS ) {
                    tempBuffer = ''
                    curState   = STATE.scriptDataEndTagOpen
                } else if ( nextChar === EXCLAMATION ) {
                    curState = STATE.scriptDataEscapeStart
                    emitCharToken( LESS_THAN )
                    emitCharToken( EXCLAMATION )
                } else {
                    emitCharToken( LESS_THAN )
                    reconsume( STATE.scriptData )
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-end-tag-open-state
            case STATE.scriptDataEndTagOpen:
                if ( risAscii.test( nextChar ) ) {
                    createTagToken( TOKEN_TYPE.endTag )
                    reconsume( STATE.scriptDataEndTagName )
                } else {
                    emitCharToken( LESS_THAN )
                    emitCharToken( SOLIDUS )
                    reconsume( STATE.scriptData )
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-end-tag-name-state
            case STATE.scriptDataEndTagName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.beforeAttributeName
                        break
                    }

                } else if ( nextChar === SOLIDUS ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.selfClosingStartTag
                        break
                    }
                } else if ( nextChar === GREATER_THAN ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.data
                        emitTagToken( curTagToken )
                        break
                    }
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar.toLowerCase()
                    tempBuffer += nextChar
                    break
                } else if ( risLowercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar
                    tempBuffer += nextChar
                    break
                }

                emitCharToken( LESS_THAN )
                emitCharToken( SOLIDUS )
                emitCharToken( tempBuffer )
                tempBuffer = '' //TODO:?
                reconsume( STATE.scriptData )

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escape-start-state
            case STATE.scriptDataEscapeStart:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.scriptDataEscapeStartDash
                    emitCharToken( HYPHEN_MINUS )
                } else {
                    reconsume( STATE.scriptData )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escape-start-dash-state
            case STATE.scriptDataEscapeStartDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.scriptDataEscapedDashDash
                    emitCharToken( HYPHEN_MINUS )
                } else {
                    reconsume( STATE.scriptData )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escaped-state
            case STATE.scriptDataEscaped:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.scriptDataEscapedDash
                    emitCharToken( HYPHEN_MINUS )
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.scriptDataEscapedLessThanSign
                } else if ( nextChar === NULL ) {
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escaped-dash-state
            case STATE.scriptDataEscapedDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.scriptDataEscapedDashDash
                    emitCharToken( HYPHEN_MINUS )
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.scriptDataEscapedLessThanSign
                } else if ( nextChar === NULL ) {
                    curState = STATE.scriptDataEscaped
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    curState = STATE.scriptDataEscaped
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escaped-dash-dash-state
            case STATE.scriptDataEscapedDashDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    emitCharToken( HYPHEN_MINUS )
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.scriptDataEscapedLessThanSign
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.scriptData
                    emitCharToken( GREATER_THAN )
                } else if ( nextChar === NULL ) {
                    curState = STATE.scriptDataEscaped
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    curState = STATE.scriptDataEscaped
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escaped-less-than-sign-state
            case STATE.scriptDataEscapedLessThanSign:
                if ( nextChar === SOLIDUS ) {
                    tempBuffer = ''
                    curState   = STATE.scriptDataEscapedEndTagOpen
                } else if ( risAscii.test( nextChar ) ) {
                    tempBuffer = ''
                    emitCharToken( LESS_THAN )
                    reconsume( STATE.scriptDataDoubleEscapeStart )
                } else {
                    emitCharToken( LESS_THAN )
                    reconsume( STATE.scriptDataEscaped )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escaped-end-tag-open-state
            case STATE.scriptDataEscapedEndTagOpen:
                if ( risAscii.test( nextChar ) ) {
                    createTagToken( TOKEN_TYPE.endTag )
                    reconsume( STATE.scriptDataEscapedEndTagName )
                } else {
                    emitCharToken( LESS_THAN )
                    emitCharToken( SOLIDUS )
                    reconsume( STATE.scriptDataEscaped )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-escaped-end-tag-name-state
            case STATE.scriptDataEscapedEndTagName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.beforeAttributeName
                        break
                    }

                } else if ( nextChar === SOLIDUS ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.selfClosingStartTag
                        break
                    }
                } else if ( nextChar === GREATER_THAN ) {
                    if ( isAppropriateEndTagToken() ) {
                        curState = STATE.data
                        emitTagToken( curTagToken )
                        break
                    }
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar.toLowerCase()
                    tempBuffer += nextChar
                    break
                } else if ( risLowercaseAscii.test( nextChar ) ) {
                    curTagToken.tagName += nextChar
                    tempBuffer += nextChar
                    break
                }

                emitCharToken( LESS_THAN )
                emitCharToken( SOLIDUS )
                emitCharToken( tempBuffer )
                tempBuffer = '' //TODO:?
                reconsume( STATE.scriptDataEscaped )
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-double-escape-start-state
            case STATE.scriptDataDoubleEscapeStart:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE ||
                    nextChar === SOLIDUS ||
                    nextChar === GREATER_THAN
                ) {
                    if ( tempBuffer === SCRIPT ) {
                        curState = STATE.scriptDataDoubleEscaped
                    } else {
                        curState = STATE.scriptDataEscaped
                    }

                    emitCharToken()
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    tempBuffer += nextChar.toLowerCase()
                    emitCharToken()
                    break
                } else if ( risLowercaseAscii.test( nextChar ) ) {
                    tempBuffer += nextChar
                    emitCharToken()
                    break
                }

                reconsume( STATE.scriptDataEscaped )
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-double-escaped-state
            case STATE.scriptDataDoubleEscaped:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.scriptDataDoubleEscapedDash
                    emitCharToken( HYPHEN_MINUS )
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.scriptDataDoubleEscapedLessThanSign
                    emitCharToken( LESS_THAN )
                } else if ( nextChar === NULL ) {
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-double-escaped-dash-state
            case STATE.scriptDataDoubleEscapedDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.scriptDataDoubleEscapedDashDash
                    emitCharToken( HYPHEN_MINUS )
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.scriptDataDoubleEscapedLessThanSign
                    emitCharToken( LESS_THAN )
                } else if ( nextChar === NULL ) {
                    curState = STATE.scriptDataDoubleEscaped
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    curState = STATE.scriptDataDoubleEscaped
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-double-escaped-dash-dash-state
            case STATE.scriptDataDoubleEscapedDashDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    emitCharToken( HYPHEN_MINUS )
                } else if ( nextChar === LESS_THAN ) {
                    curState = STATE.scriptDataDoubleEscapedLessThanSign
                    emitCharToken( LESS_THAN )
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.scriptData
                    emitCharToken( GREATER_THAN )
                } else if ( nextChar === NULL ) {
                    curState = STATE.scriptDataDoubleEscaped
                    emitCharToken( REPLACEMENT_CHARACTER )
                } else {
                    curState = STATE.scriptDataDoubleEscaped
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-double-escaped-less-than-sign-state
            case STATE.scriptDataDoubleEscapedLessThanSign:
                if ( nextChar === SOLIDUS ) {
                    tempBuffer = ''
                    curState   = STATE.scriptDataDoubleEscapeEnd
                    emitCharToken( SOLIDUS )
                } else {
                    reconsume( STATE.scriptDataDoubleEscaped )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#script-data-double-escape-end-state
            case STATE.scriptDataDoubleEscapeEnd:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE ||
                    nextChar === SOLIDUS ||
                    nextChar === GREATER_THAN
                ) {
                    if ( tempBuffer === SCRIPT ) {
                        curState = STATE.scriptDataEscaped
                    } else {
                        curState = STATE.scriptDataDoubleEscaped
                    }

                    emitCharToken()
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    tempBuffer += nextChar.toLowerCase()
                    emitCharToken()
                    break
                } else if ( risLowercaseAscii.test( nextChar ) ) {
                    tempBuffer += nextChar
                    emitCharToken()
                    break
                }

                reconsume( STATE.scriptDataDoubleEscaped )
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-name-state
            case STATE.beforeAttributeName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === SOLIDUS || nextChar === GREATER_THAN ) {
                    reconsume( STATE.afterAttributeName )
                } else if ( nextChar === EQUALS ) {
                    curTagToken.attributes.push( curAttribute = {
                        name : nextChar,
                        value: ''
                    } )
                    curState = STATE.attributeName
                } else {
                    curTagToken.attributes.push( curAttribute = {
                        name : '',
                        value: ''
                    } )

                    reconsume( STATE.attributeName )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#attribute-name-state
            case STATE.attributeName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE ||
                    nextChar === SOLIDUS ||
                    nextChar === GREATER_THAN
                ) {
                    reconsume( STATE.afterAttributeName )
                } else if ( nextChar === EQUALS ) {
                    curState = STATE.beforeAttributeValue
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    curAttribute.name += nextChar.toLowerCase()
                } else if ( nextChar === NULL ) {
                    curAttribute.name += REPLACEMENT_CHARACTER
                } else {
                    curAttribute.name += nextChar
                }
                //TODO: remove duplicate attribute. discard newer attribute
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#after-attribute-name-state
            case STATE.afterAttributeName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === SOLIDUS ) {
                    curState = STATE.selfClosingStartTag
                } else if ( nextChar === EQUALS ) {
                    curState = STATE.beforeAttributeValue
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    createTagToken( TOKEN_TYPE.attribute )
                    curTagToken.attributes.push( curAttribute = {
                        name : '',
                        value: ''
                    } )
                    reconsume( STATE.attributeName )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state
            case STATE.beforeAttributeValue:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === QUOTATION ) {
                    curState = STATE.attributeValueDoubleQuoted
                } else if ( nextChar === APOSTROPHE ) {
                    curState = STATE.attributeValueSingleQuoted
                } else {
                    reconsume( STATE.attributeValueUnquoted )
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state
            case STATE.attributeValueDoubleQuoted:
                if ( nextChar === QUOTATION ) {
                    curState = STATE.afterAttributeValueQuoted
                } else if ( nextChar === AMPERSAND ) {
                    returnState = curState
                    curState    = STATE.characterReference
                } else if ( nextChar === NULL ) {
                    curAttribute.value += REPLACEMENT_CHARACTER
                } else {
                    curAttribute.value += nextChar
                }
                break


                //https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state
            case STATE.attributeValueSingleQuoted:
                if ( nextChar === APOSTROPHE ) {
                    curState = STATE.afterAttributeValueQuoted
                } else if ( nextChar === AMPERSAND ) {
                    returnState = curState
                    curState    = STATE.characterReference
                } else if ( nextChar === NULL ) {
                    curAttribute.value += REPLACEMENT_CHARACTER
                } else {
                    curAttribute.value += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
            case STATE.attributeValueUnquoted:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.beforeAttributeName
                } else if ( nextChar === AMPERSAND ) {
                    returnState = curState
                    curState    = STATE.characterReference
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else if ( nextChar === NULL ) {
                    curAttribute.value += REPLACEMENT_CHARACTER
                } else {
                    curAttribute.value += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#after-attribute-value-(quoted)-state
            case STATE.afterAttributeValueQuoted:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.beforeAttributeName
                } else if ( nextChar === SOLIDUS ) {
                    curState = STATE.selfClosingStartTag
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    reconsume( STATE.beforeAttributeName )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#self-closing-start-tag-state
            case STATE.selfClosingStartTag:
                if ( nextChar === GREATER_THAN ) {
                    curTagToken.selfClosing = true
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    reconsume( STATE.beforeAttributeName )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#bogus-comment-state
            case STATE.bogusComment:
                if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else if ( nextChar === NULL ) {
                    curTagToken.data += REPLACEMENT_CHARACTER
                } else {
                    curTagToken.data += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#markup-declaration-open-state
            case STATE.markupDeclarationOpen:
                //TODO
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-start-state
            case STATE.commentStart:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.commentStartDash
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    reconsume( STATE.comment )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-start-dash-state
            case STATE.commentStartDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.commentEnd
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.data += HYPHEN_MINUS
                    reconsume( STATE.comment )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-state
            case STATE.comment:
                if ( nextChar === LESS_THAN ) {
                    curTagToken.data += nextChar
                    curState = STATE.commentLessThanSign
                } else if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.commentEndDash
                } else if ( nextChar === NULL ) {
                    curTagToken.data += REPLACEMENT_CHARACTER
                } else {
                    curTagToken.data += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-less-than-sign-state
            case STATE.commentLessThanSign:
                if ( nextChar === EXCLAMATION ) {
                    curTagToken.data += nextChar
                    curState = STATE.commentLessThanSignBang
                } else if ( nextChar === LESS_THAN ) {
                    curTagToken.data += nextChar
                } else {
                    reconsume( STATE.comment )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-less-than-sign-bang-state
            case STATE.commentLessThanSignBang:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.commentLessThanSignBangDash
                } else {
                    reconsume( STATE.comment )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-less-than-sign-bang-dash-state
            case STATE.commentLessThanSignBangDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.commentLessThanSignBangDashDash
                } else {
                    reconsume( STATE.commentEndDash )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-less-than-sign-bang-dash-dash-state
            case STATE.commentLessThanSignBangDashDash:
                reconsume( STATE.commentEnd )
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-end-dash-state
            case STATE.commentEndDash:
                if ( nextChar === HYPHEN_MINUS ) {
                    curState = STATE.commentEnd
                } else {
                    curTagToken.data += HYPHEN_MINUS
                    reconsume( STATE.comment )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-end-state
            case STATE.commentEnd:
                if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else if ( nextChar === EXCLAMATION ) {
                    curState = STATE.commentEndBang
                } else if ( nextChar === HYPHEN_MINUS ) {
                    curTagToken.data += HYPHEN_MINUS
                } else {
                    curTagToken.data += HYPHEN_MINUS
                    reconsume( STATE.comment )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#comment-end-bang-state
            case STATE.commentEndBang:
                if ( nextChar === HYPHEN_MINUS ) {
                    curTagToken.data += HYPHEN_MINUS + EXCLAMATION
                    curState = STATE.commentEndDash
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.data += HYPHEN_MINUS + EXCLAMATION
                    reconsume( STATE.comment )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#doctype-state
            case STATE.DOCTYPE:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.beforeDOCTYPEName
                } else {
                    reconsume( STATE.beforeDOCTYPEName )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#before-doctype-name-state
            case STATE.beforeDOCTYPEName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    createTagToken( TOKEN_TYPE.doctype )
                    curTagToken.name = nextChar.toLowerCase()
                    curState         = STATE.DOCTYPEName
                } else if ( nextChar === NULL ) {
                    createTagToken( TOKEN_TYPE.doctype )
                    curTagToken.name = REPLACEMENT_CHARACTER
                    curState         = STATE.DOCTYPEName
                } else if ( nextChar === GREATER_THAN ) {
                    createTagToken( TOKEN_TYPE.doctype )
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    createTagToken( TOKEN_TYPE.doctype )
                    curTagToken.name = nextChar
                    curState         = STATE.DOCTYPEName
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#doctype-name-state
            case STATE.DOCTYPEName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.afterDOCTYPEName
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else if ( risUppercaseAscii.test( nextChar ) ) {
                    curTagToken.name += nextChar.toLowerCase()
                } else if ( nextChar === NULL ) {
                    curTagToken.name += REPLACEMENT_CHARACTER
                } else {
                    curTagToken.name += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#after-doctype-name-state
            case STATE.afterDOCTYPEName:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    //TODO
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#after-doctype-public-keyword-state
            case STATE.afterDOCTYPEPublicKeyword:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.beforeDOCTYPEPublicIdentifier
                } else if ( nextChar === QUOTATION ) {
                    curTagToken.publicIdentifier = ''
                    curState                     = STATE.DOCTYPEPublicIdentifierDoubleQuoted
                } else if ( nextChar === APOSTROPHE ) {
                    curTagToken.publicIdentifier = ''
                    curState                     = STATE.DOCTYPEPublicIdentifierSingleQuoted
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.bogusDOCTYPE
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#before-doctype-public-identifier-state
            case STATE.beforeDOCTYPEPublicIdentifier:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === QUOTATION ) {
                    curTagToken.publicIdentifier = ''
                    curState                     = STATE.DOCTYPEPublicIdentifierDoubleQuoted
                } else if ( nextChar === APOSTROPHE ) {
                    curTagToken.publicIdentifier = ''
                    curState                     = STATE.DOCTYPEPublicIdentifierSingleQuoted
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.bogusDOCTYPE
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#doctype-public-identifier-(double-quoted)-state
            case STATE.DOCTYPEPublicIdentifierDoubleQuoted:
                if ( nextChar === QUOTATION ) {
                    curState = STATE.afterDOCTYPEPublicIdentifier
                } else if ( nextChar === NULL ) {
                    curTagToken.publicIdentifier += REPLACEMENT_CHARACTER
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.publicIdentifier += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#doctype-public-identifier-(single-quoted)-state
            case STATE.DOCTYPEPublicIdentifierSingleQuoted:
                if ( nextChar === APOSTROPHE ) {
                    curState = STATE.afterDOCTYPEPublicIdentifier
                } else if ( nextChar === NULL ) {
                    curTagToken.publicIdentifier += REPLACEMENT_CHARACTER
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.publicIdentifier += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#after-doctype-public-identifier-state
            case STATE.afterDOCTYPEPublicIdentifier:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.betweenDOCTYPEPublicAndSystemIdentifiers
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else if ( nextChar === QUOTATION ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierDoubleQuoted
                } else if ( nextChar === APOSTROPHE ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierSingleQuoted
                } else {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.bogusDOCTYPE
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#between-doctype-public-and-system-identifiers-state
            case STATE.betweenDOCTYPEPublicAndSystemIdentifiers:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else if ( nextChar === QUOTATION ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierDoubleQuoted
                } else if ( nextChar === APOSTROPHE ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierSingleQuoted
                } else {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.bogusDOCTYPE
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#after-doctype-system-keyword-state
            case STATE.afterDOCTYPESystemKeyword:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    curState = STATE.beforeDOCTYPESystemIdentifier
                } else if ( nextChar === QUOTATION ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierDoubleQuoted
                } else if ( nextChar === APOSTROPHE ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierSingleQuoted
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.bogusDOCTYPE
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#before-doctype-system-identifier-state
            case STATE.beforeDOCTYPESystemIdentifier:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === QUOTATION ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierDoubleQuoted
                } else if ( nextChar === APOSTROPHE ) {
                    curTagToken.systemIdentifier = ''
                    curState                     = STATE.DOCTYPESystemIdentifierSingleQuoted
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.bogusDOCTYPE
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#doctype-system-identifier-(double-quoted)-state
            case STATE.DOCTYPESystemIdentifierDoubleQuoted:
                if ( nextChar === QUOTATION ) {
                    curState = STATE.afterDOCTYPESystemIdentifier
                } else if ( nextChar === NULL ) {
                    curTagToken.systemIdentifier += REPLACEMENT_CHARACTER
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.systemIdentifier += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#doctype-system-identifier-(single-quoted)-state
            case STATE.DOCTYPESystemIdentifierSingleQuoted:
                if ( nextChar === APOSTROPHE ) {
                    curState = STATE.afterDOCTYPESystemIdentifier
                } else if ( nextChar === NULL ) {
                    curTagToken.systemIdentifier += REPLACEMENT_CHARACTER
                } else if ( nextChar === GREATER_THAN ) {
                    curTagToken.forceQuirks = ON
                    curState                = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curTagToken.systemIdentifier += nextChar
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#after-doctype-system-identifier-state
            case STATE.afterDOCTYPESystemIdentifier:
                if (
                    nextChar === CHARACTER_TABULATION ||
                    nextChar === LINE_FEED ||
                    nextChar === FORM_FEED ||
                    nextChar === SPACE
                ) {
                    break
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                } else {
                    curState = STATE.bogusDOCTYPE
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#bogus-doctype-state
            case STATE.bogusDOCTYPE:
                if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                    emitTagToken( curTagToken )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#cdata-section-state
            case STATE.CDATASection:
                if ( nextChar === RIGHT_SQUARE_BRACKET ) {
                    curState = STATE.CDATASectionBracket
                } else {
                    emitCharToken()
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#cdata-section-bracket-state
            case STATE.CDATASectionBracket:
                if ( nextChar === RIGHT_SQUARE_BRACKET ) {
                    curState = STATE.CDATASectionEnd
                } else {
                    emitCharToken( RIGHT_SQUARE_BRACKET )
                    reconsume( STATE.CDATASection )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#cdata-section-end-state
            case STATE.CDATASectionEnd:
                if ( nextChar === RIGHT_SQUARE_BRACKET ) {
                    emitCharToken( RIGHT_SQUARE_BRACKET )
                } else if ( nextChar === GREATER_THAN ) {
                    curState = STATE.data
                } else {
                    emitCharToken( RIGHT_SQUARE_BRACKET )
                    emitCharToken( RIGHT_SQUARE_BRACKET )
                    reconsume( STATE.CDATASection )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#character-reference-state
            case STATE.characterReference:
                //TODO
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#numeric-character-reference-state
            case STATE.numericCharacterReference:
                characterReferenceCode = 0
                if ( nextChar === SMALL_X || nextChar === CAPITAL_X ) {
                    tempBuffer += nextChar
                    curState = STATE.hexademicalCharacterReferenceStart
                } else {
                    reconsume( STATE.decimalCharacterReferenceStart )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#hexademical-character-reference-start-state
            case STATE.hexademicalCharacterReferenceStart:
                if ( risHexDigits.test( nextChar ) ) {
                    reconsume( STATE.hexademicalCharacterReference )
                } else {
                    reconsume( STATE.characterReferenceEnd )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#decimal-character-reference-start-state
            case STATE.decimalCharacterReferenceStart:
                if ( risDigit.test( nextChar ) ) {
                    reconsume( STATE.decimalCharacterReference )
                } else {
                    reconsume( STATE.characterReferenceEnd )
                }
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#hexademical-character-reference-state
            case STATE.hexademicalCharacterReference:
                //TODO
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#decimal-character-reference-state
            case STATE.decimalCharacterReference:
                if ( risDigit.test( nextChar ) ) {
                    characterReferenceCode *= 10
                    characterReferenceCode += parseInt( nextChar )
                } else if ( nextChar === SEMICOLON ) {
                    curState = STATE.numericCharacterReferenceEnd
                } else {
                    reconsume( STATE.numericCharacterReferenceEnd )
                }

                break

                //https://html.spec.whatwg.org/multipage/syntax.html#numeric-character-reference-end-state
            case STATE.numericCharacterReferenceEnd:
                //TODO
                break

                //https://html.spec.whatwg.org/multipage/syntax.html#character-reference-end-state
            case STATE.characterReferenceEnd:

                if (
                    returnState === STATE.attributeValueDoubleQuoted ||
                    returnState === STATE.attributeValueSingleQuoted ||
                    returnState === STATE.attributeValueUnquoted
                ) {
                    curAttribute.value += tempBuffer
                } else {
                    emitCharToken( tempBuffer )
                }

                reconsume( returnState )
                break
            }
        }

        if (
            curState === STATE.DOCTYPE ||
            curState === STATE.beforeDOCTYPEName ||
            curState === STATE.DOCTYPEName ||
            curState === STATE.afterDOCTYPEName ||
            curState === STATE.afterDOCTYPEPublicKeyword ||
            curState === STATE.beforeDOCTYPEPublicIdentifier ||
            curState === STATE.DOCTYPEPublicIdentifierDoubleQuoted ||
            curState === STATE.DOCTYPEPublicIdentifierSingleQuoted ||
            curState === STATE.afterDOCTYPEPublicIdentifier ||
            curState === STATE.betweenDOCTYPEPublicAndSystemIdentifiers ||
            curState === STATE.beforeDOCTYPESystemIdentifier ||
            curState === STATE.afterDOCTYPESystemKeyword ||
            curState === STATE.DOCTYPESystemIdentifierDoubleQuoted ||
            curState === STATE.DOCTYPESystemIdentifierSingleQuoted ||
            curState === STATE.afterDOCTYPESystemIdentifier
        ) {
            createTagToken( TOKEN_TYPE.doctype )
            curTagToken.forceQuirks = ON
            emitTagToken( curTagToken )
        } else if ( curState === STATE.bogusDOCTYPE ) {
            emitTagToken( curTagToken )
        }

        emitTagToken( createTagToken( TOKEN_TYPE.eof ) )

        return tokens

        function emitCharToken( char ) {
            tokens.push( {
                type : TOKEN_TYPE.character,
                value: char || nextChar
            } )
        }

        function emitTagToken( token ) {
            tokens.push( token )

            if ( token.type === TOKEN_TYPE.startTag ) {
                _lastStartTag = token
            }
        }

        function createTagToken( type ) {
            switch ( type ) {
            case TOKEN_TYPE.doctype:
                curTagToken = {
                    type            : type,
                    name            : MISSING,
                    publicIdentifier: MISSING,
                    systemIdentifier: MISSING,
                    forceQuirks     : OFF
                }
                break

            case TOKEN_TYPE.startTag:
            case TOKEN_TYPE.endTag:
                curTagToken = {
                    type       : type,
                    tagName    : '',
                    attributes : [],
                    selfClosing: undefined
                }
                break

            case TOKEN_TYPE.character:
            case TOKEN_TYPE.comment:
                curTagToken = {
                    type: type,
                    data: ''
                }
                break

            case TOKEN_TYPE.eof:
                curTagToken = {
                    type: type
                }
            }

            return curTagToken
        }

        function reconsume( state ) {
            --i
            curState = state
        }

        function isAppropriateEndTagToken() {
            return _lastStartTag && _lastStartTag.value === curTagToken.value
        }
    }

    var parser = function ( html ) {
        console.log( tokenizer( html ) )
    }

    g.HTMLParser = parser
}( this ))
