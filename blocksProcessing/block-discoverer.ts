// Docs here: https://esprima.readthedocs.io/en/latest/
import * as esprima from "esprima";
import { IBlock } from "./block";

enum TokenType {
    Unknown,
    Punctuator,
    Identifier,
    Keyword
}

interface IPos {
    line: number;
    column: number;
}


interface IToken {
    type: TokenType;
    rawType: string;
    value: string;
    // range: {
    //     start: number;
    //     end: number;
    // },
    loc: {
        start: IPos,
        end: IPos
    }
}

function tokenize(text: string): IToken[] {
    const rawTokens = esprima.tokenize(text, { range: true, loc: true });

    return rawTokens.map(t => ({
        type: parseType(t.type),
        rawType: t.type,
        value: t.value,
        // range: {
        //     start: (t as any).range[0],
        //     end: (t as any).range[1]
        // },
        loc: (t as any).loc
    }));
}

function parseType(value: string): TokenType {
    switch (value) {
        case "Punctuator":
            return TokenType.Punctuator;

        case "Identifier":
            return TokenType.Identifier;

        case "Keyword":
            return TokenType.Keyword;
    }

    return TokenType.Unknown;
}

function discoverFunction(tokens: IToken[], index: number): IBlock | undefined {
    const token = tokens[index];

    const blockStartIndex = findNextToken(tokens, index, isBlockStart);

    if (token.type === TokenType.Keyword && token.value === "function") {
        const nameToken = tokens[index - 2];
        if (nameToken.type !== TokenType.Identifier) {
            throw new Error("Function name expected");
        }

        let openedBlocks = 1;
        const blockEndIndex = findNextToken(tokens, blockStartIndex + 1, (t: IToken) => {
            if(isBlockStart(t)) {
                openedBlocks += 1;
            }

            if(isBlockEnd(t)){
                openedBlocks -=1;
            }

            return openedBlocks === 0;
        });

        return {
            name: nameToken.value,
            startLine: token.loc.end.line,
            endLine: tokens[blockEndIndex].loc.start.line
        };
    }

    return undefined;
}

function findNextToken(
    tokens: IToken[],
    startIndex: number,
    predicate: (token: IToken) => boolean
): number {
    let currentIndex = startIndex;
    const maxIndex = tokens.length - 1;
    while (currentIndex <= maxIndex) {
        if (predicate(tokens[currentIndex])) {
            break;
        }

        currentIndex += 1;
    }

    if (currentIndex == maxIndex) {
        throw new Error("Token not found");
    }

    return currentIndex;
}

function isBlockStart(token: IToken) {
    return token.type === TokenType.Punctuator && token.value === "{";
}

function isBlockEnd(token: IToken) {
    return token.type === TokenType.Punctuator && token.value === "}";
}

function discover(text: string): IBlock[] {
    const tokens = tokenize(text);
    const functions: IBlock[] = [];

    tokens.forEach((_, index) => {
        const func = discoverFunction(tokens, index);
        if (func) {
            functions.push(func);
        }
    });

    return functions;
}

export {
    IBlock,
    discover
};