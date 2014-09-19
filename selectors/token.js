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
            Punctuator: 5
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


    function isPunctuator(c) {
        switch(c) {
            case '#':
            case '.':
            case ',':
            case '+':
            case '>':
            case '~':
            case '=':
            case '|':
            case '^':
            case '$':
            case '*':
            case ':':
            case '@':
            case '%':
            case '(':
            case ')':
                return true;
        }
        return false;
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
        }
    }

    function scanName() {
        var start = tokPos, c;

        while((c = input[tokPos++]) && rname.test(c));

        tokPos--;

        return {
            type: tokType.Identifier,
            start: start + 1,
            end: tokPos + 1,
            value: input.slice(start, tokPos)
        };
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

        if(isPunctuator(c)) {
            return scanPunctuator();
        }

        return {
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

        return tokens;
    }

    global.tokenize = tokenize;
}(window));

console.log(tokenize(' "123 fdas" \'da\' #test div.active'));