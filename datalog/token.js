/**
 * Datalog
 * http://docs.racket-lang.org/datalog/datalog.html
 */

!function(global) {
    var input,
        length,

        line,
        column,
        curPos,
        tokens,

        TOKEN_TYPE = {
            EOF: 1,
            Identifier: 2,
            StringLiteral: 3,
            Punctuator: 4,
            Clause: 5,
            Comment: 6
        },

        rblank = /\s/;

    var EXCLAMATION  = 0x21,
        DOUBLE_QUOTE = 0x22,
        PERCENT      = 0x25,
        COLON        = 0x3A;

    function isIdentifier(ch) {
        var flag = true;

        switch(ch) {
            case '(':
            case ')':
            case '`':
            case '\'':
            case '=':
            case ':':
            case '.':
            case '~':
            case '?':
            case '"':
            case '%':
            case ' ':
            case ',':
                flag = false;
                break;
        }
        return flag;
    }

    function scanIdentifier() {
        var identifier = '',
            column = curPos + 1;

        while(isIdentifier(ch = input[curPos++])) {
            identifier += ch;
        }

        curPos -= 1;

        tokens.push({
            type: TOKEN_TYPE.Identifier,
            value: identifier,
            column: column,
            line: line
        })
    }

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    function scanLineTerminator() {
        line += 1;
        column = 1;
    }

    function isWhiteSpace(c) {
        return rblank.test(c);
    }

    function skipWhiteSpace() {
        var c;
        while(isWhiteSpace(c = input[curPos])) {
            column += 1;
            curPos += 1;
        }
    }

    function scanString() {
        var ch = input[curPos],
            index;

        if((index = input.indexOf(ch, curPos + 1)) > -1) {
            tokens.push({
                type: TOKEN_TYPE.StringLiteral,
                value: input.slice(curPos + 1, index),
                column: column,
                line: line
            });
            curPos = index + 1;
            column = curPos + 1;
        } else {
            throw Error('line %i, column %i String literal must end with a double quote.', line, column);
        }
    }

    function skipComment() {
        var ch = input[curPos].charCodeAt(0);

        if(ch === PERCENT) {
            var lineBreak = input.indexOf('\n', curPos);
            if(lineBreak > -1) {
                tokens.push({
                    type: TOKEN_TYPE.Comment,
                    value: input.slice(curPos + 1, lineBreak),
                    column: curPos + 1,
                    line: line
                });

                curPos = lineBreak + 1;
                line += 1;
                column = 1;
            }
        }
    }

    function isPunctuator(ch) {
        var flag = false;

        switch(ch) {
            case '(':
            case ')':
            case '=':
            case '.':
            case '~':
            case '?':
            case ':':
            case '!':
            case ',':
                flag = true;
                break;
        }
        return flag;
    }

    function scanPunctuator() {
        var ch = input[curPos].charCodeAt(0);

        if(ch === COLON) {
            expect('-');

            tokens.push({
                type: TOKEN_TYPE.Clause,
                value: ':-',
                column: column,
                line: line
            });

            return column = (curPos += 2) + 1
        }

        if(ch === EXCLAMATION) {
            expect('=');

            tokens.push({
                type: TOKEN_TYPE.Punctuator,
                value: '!=',
                column: column,
                line: line
            });

            return column = (curPos += 2) + 1;
        }

        tokens.push({
            type: TOKEN_TYPE.Punctuator,
            value: input[curPos],
            column: column,
            line: line
        });

        return column = (curPos += 1) + 1;
    }

    function expect(t) {
        if(t && t.length) {
            if(t === input.slice(curPos + 1, curPos + 1 + t.length)) return;
        }

        throw Error('Expect %s at line %i column %i', t, line, column);
    }

    function check() {
        skipComment();
        while(curPos < length) {
            var c  = input[curPos],
                ch = c.charCodeAt(0);

            if(isIdentifier(c)) {
                scanIdentifier();
            } else if(ch === DOUBLE_QUOTE) {
                scanString();
            } else if(ch === PERCENT) {
                skipComment();
            } else if(isPunctuator(c)) {
                scanPunctuator();
            } else if(isLineTerminator(ch)) {
                scanLineTerminator();
            } else if(isWhiteSpace(c)) {
                skipWhiteSpace();
            } else {
                //TODO
                curPos++;
                column++;
            }
        }
    }

    global.tokenize = function(source) {
        input  = source || '';
        length = input.length;
        curPos = 0;
        line   = column = 1;
        tokens = [];

        if(length <= curPos) return;
        check();

        return tokens;
    }
}(window);

var source = 'edge(a, b). edge(b, c). edge(c, d). edge(d, a).\n\
              path(X, Y) :- edge(X, Y).\n\
              path(X, Y) :- edge(X, Z), path(Z, Y).\n\
              path(X, Y)?';

console.log(tokenize(source));