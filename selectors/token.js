(function(global) {
    var input,
        tokPos,
        tokens,
        length,

        tokType = {
            EOF: 1,
            Identifier: 2,
            StringLiteral: 3,
            WhiteSpace: 4,
            Punctuator: 5,
            PseudoElement: 6,
            PseudoClass: 7
        },

        isDoubleQuote = false,
        isSingleQuote = false,

        /**
         * http://www.w3.org/TR/selectors/#lex
         */
        nonascii = '[^\0-\177]',
        unicode  = '\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?',
        escape   = '(' + unicode + ')|\\[^\n\r\f0-9a-f]',
        nmstart  = '[_a-z]|(' + nonascii + ')|(' + escape + ')',
        nmchar   = '[_a-z0-9-]|(' + nonascii + ')|(' + escape + ')',
        iden     = '[-]?(' + nmstart + ')(' + nmchar + ')*',
        name     = '(' + nmchar + ')+',

        rname     = new RegExp(name),
        rstr      = /(?:[^\n\r\f\\"]|\n|\r\n|\r|\f)/,
        rnonascii = /[^\0-\177]/,
        rescape   = new RegExp(escape);


    /**
     * http://www.w3.org/TR/selectors/#whitespace
     */
    function isWhiteSpace(ch) {
        return ch === 0x20 || ch === 0x09 || ch === 0x0A || ch === 0x0C || ch === 0x0D;
    }

    function scanWhiteSpace() {
        var ch, start = tokPos;

        while((ch = input[tokPos++]) && isWhiteSpace(ch.charCodeAt(0)));

        tokPos--;

        return {
            type: tokType.WhiteSpace,
            start: start + 1,
            end: tokPos + 1,
            value: input.slice(start, tokPos)
        };
    }

    /**
     * http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
     */
    function isIdentifierStart(ch, c) {
        //0x2D -
        return ch === 0x2D || (ch >= 0x61 && ch <= 0x7A) || rnonascii.test(c) || rescape.test(c);
    }

    function isIdentifier(ch, c) {
        return isIdentifierStart(ch, c) || (ch >= 0x30 && ch <= 0x39);
    }

    function scanIdentifier() {
        var start = tokPos,
            c;

        while((c = input[++tokPos]) && isIdentifier(c.charCodeAt(0)));

        return {
            type: tokType.Identifier,
            start: start + 1,
            end: tokPos,
            value: input.slice(start, tokPos)
        };
    }

    function isStringLiteralBegin(ch) {
        //0x22 "
        //0x27 '
        return (ch === 0x22 && (isDoubleQuote = true)) || (ch === 0x27 && (isSingleQuote = true));
    }

    function isStringLiteral(c) {
        return c !== (isDoubleQuote ? '"' : '\'') && (rstr.test(c) || rnonascii.test(c) || rescape.test(c));
    }

    function scanStringLiteral() {
        var c,
            start = tokPos;

        while((c = input[++tokPos]) && isStringLiteral(c));

        if(c !== (isDoubleQuote ? '"' : '\'')) {
            throw Error({
                message: 'String didn\'t finished. column must be " or \''
            })
        }

        tokPos++;
        isDoubleQuote = isSingleQuote = false;

        return {
            type: tokType.StringLiteral,
            start: start + 1,
            end: tokPos + 1,
            value: input.slice(start, tokPos)
        };
    }

    function scanPunctuator() {
        var c = input[tokPos];

        switch(c) {
            case '#':
            case '.':
                tokens.push({
                    type: tokType.Punctuator,
                    start: tokPos + 1,
                    end: tokPos + 2,
                    value: c
                });
                tokPos++;
                return scanName();

            case '*':
            case ',':
                tokPos++;
                return {
                    type: tokType.Punctuator,
                    start: tokPos,
                    end: tokPos + 1,
                    value: c
                };

            case '[':
                tokPos++;
                tokens.push({
                    type: tokType.Punctuator,
                    start: tokPos,
                    end: tokPos + 1,
                    value: c
                });
                return scanAttribute();

            case ':':
                tokPos++;
                return input[tokPos] === ':' ? scanPseudoElement() : scanPseudoClass();
        }

        return null;
    }

    function scanName() {
        var start = tokPos, c;

        while((c = input[tokPos++]) && rname.test(c));

        tokPos--;

        if(start == tokPos) throw Error('column ' + start + ' is not a name.');

        return {
            type: tokType.Identifier,
            start: start + 1,
            end: tokPos + 1,
            value: input.slice(start, tokPos)
        };
    }

    function scanAttribute() {
        tokens.push(scanName());

        var c  = input[tokPos],
            start = tokPos + 1;

        switch(c) {
            case '=':
                tokPos++;
                tokens.push({
                    type: tokType.Punctuator,
                    start: start,
                    end: start + 1,
                    value: c
                });
                break;

            case '~':
            case '|':
            case '^':
            case '$':
            case '*':
                tokPos++;
                expect('=');
                --tokPos;
                tokens.push({
                    type: tokType.Punctuator,
                    start: start,
                    end: start + 1,
                    value: input.slice(tokPos, tokPos += 2)
                });
                break;

            case ']':
                tokPos++;
                return {
                    type: tokType.Punctuator,
                    start: start,
                    end: start + 1,
                    value: c
                };

        }

        tokens.push(isStringLiteralBegin(input[tokPos].charCodeAt(0)) ? scanStringLiteral() : scanName());

        if(input[tokPos] != ']') {
            throw Error('Attribute selector did not finished correctly.');
        }

        return {
            type: tokType.Punctuator,
            start: tokPos,
            end: tokPos + 1,
            value: input[tokPos]
        };
    }

    function scanPseudoElement() {
        var c = input[++tokPos],
            token = {
                start: tokPos - 2,
                type: tokType.PseudoElement
            };

        switch(c.toLowerCase()) {
            case 'a':
                if('after' === input.slice(tokPos, tokPos + 5).toLowerCase()) {
                    token.value = '::after';
                    token.end = token.start + 7;
                    tokPos += 5;
                    break;
                } else {
                    throw Error('column ' + start + ' need ::after');
                }

            case 'b':
                if('before' === input.slice(tokPos, tokPos + 6).toLowerCase()) {
                    token.value = '::before';
                    token.end = token.start + 8;
                    tokPos += 6;
                    break;
                } else {
                    throw Error('column ' + start + ' need ::before');
                }

            case 'f':
                if('first-line' === input.slice(tokPos, tokPos + 10).toLowerCase()) {
                    token.value = '::first-line';
                    token.end = token.start + 12;
                    tokPos += 10;
                    break;
                } else if('first-letter' === input.slice(tokPos, tokPos + 12).toLowerCase()) {
                    token.value = '::first-letter';
                    token.end = token.start + 14;
                    tokPos += 12;
                    break;
                } else {
                    throw Error('column ' + start + ' need ::first-line or ::first-letter');
                }

            default:
                throw Error('column ' + token.start + ' need a pseudo element')
        }

        return token;
    }

    function scanPseudoClass() {
        var c,
            isValid,
            pseudoClass = '',
            rpseudoClass = /[-a-zA-Z]/;
        /**
         * currently, pseudo class'name is composited by a-zA-Z and -
         */
        while((c = input[tokPos]) && rpseudoClass.test(c)) {
            pseudoClass += c;
            tokPos++;
        }

        pseudoClass = pseudoClass.toLowerCase();
        var len = pseudoClass.length;

        if(input[++tokPos] === '(') {
            return scanFunction(pseudoClass);
        }

        switch(len) {
            case 4:
                switch(pseudoClass) {
                    case 'link':
                    case 'past':
                    case 'root':
                        isValid = true;
                }
                break;

            case 5:
                switch(pseudoClass) {
                    case 'blank':
                    case 'empty':
                    case 'focus':
                    case 'hover':
                    case 'scope':
                    case 'valid':
                        isValid = true;
                }
                break;

            case 6:
                switch(pseudoClass) {
                    case 'active':
                    case 'future':
                    case 'target':
                        isValid = true;
                }
                break;

            case 7:
                switch(pseudoClass) {
                    case 'checked':
                    case 'current':
                    case 'default':
                    case 'enabled':
                    case 'invalid':
                    case 'visited':
                        isValid = true;
                }
                break;

            case 8:
                switch(pseudoClass) {
                    case 'any-link':
                    case 'disabled':
                    case 'in-range':
                    case 'optional':
                    case 'required':
                        isValid = true;
                }
                break;

            case 9:
                switch(pseudoClass) {
                    case 'read-only':
                        isValid = true;
                }
                break;

            case 10:
                switch(pseudoClass) {
                    case 'last-child':
                    case 'only-child':
                    case 'read-write':
                    case 'valid-drop':
                        isValid = true;
                }
                break;

            case 11:
                switch(pseudoClass) {
                    case 'active-drop':
                    case 'first-child':
                        isValid = true;
                }
                break;

            case 12:
                switch(pseudoClass) {
                    case 'invalid-drop':
                    case 'last-of-type':
                    case 'only-of-type':
                    case 'out-of-range':
                        isValid = true;
                }
                break;

            case 13:
                switch(pseudoClass) {
                    case 'first-of-type':
                    case 'indeterminate':
                        isValid = true;
                }
                break;

            case 17:
                switch(pseudoClass) {
                    case 'placeholder-shown':
                        isValid = true;
                }
                break;

            default:
                isValid = false;
        }

        console.log(pseudoClass);

        if(isValid) {
            return {
                type: tokType.PseudoClass,
                start: tokPos - pseudoClass.length,
                end: tokPos + 1,
                value: pseudoClass
            }
        } else {
            throw Error(pseudoClass + ' is not a valid pseudo class name!');
        }
    }

    function scanFunction(fnName) {
    }

    function expect(c) {
        if(input.slice(tokPos, tokPos + c.length) !== c) {
            throw Error('column ' + (tokPos + 1) + ' need ' + c);
        }
    }

    function advance() {
        if(tokPos >= length) return {
            type: tokType.EOF
        };

        var c  = input[tokPos],
            ch = c.charCodeAt(0);

        if(isWhiteSpace(ch, c)) {
            return scanWhiteSpace();
        }

        if(isIdentifier(ch, c)) {
            return scanIdentifier();
        }

        if(isStringLiteralBegin(ch)) {
            return scanStringLiteral();
        }

        return scanPunctuator() || {
            type: tokType.EOF
        };
    }

    function check() {
        var token;

        while(token = advance()) {
            tokens.push(token);
            if(token.type == tokType.EOF) return;
        }
    }

    function tokenize(source) {
        if(!source) return null;

        input  = source;
        length = source.length;
        tokPos = 0;
        tokens = [];

        check();

        isDoubleQuote = isSingleQuote = false;

        return tokens;
    }

    global.tokenize = tokenize;
}(window));

console.log(tokenize('#qunit-fixture div:hover'));