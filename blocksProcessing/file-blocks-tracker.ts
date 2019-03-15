import { IBlock } from "./block";

interface IChunk {
    start: number;
    newStart: number;
    deletedLines: string[];
    addedLines: string[];
}

interface IBlockChange {
    startDelta: number;
    endDelta: number;
}

function countOccurences(text: string, substring: string) {
    return text.split(substring).length - 1;
}

function findNewBlockStart(deletedLines: string[], addedLines: string[], prevStartLineIndex: number) {
    let currentLineIndex = addedLines.length - 1;

    let balance = 1; // suppose that block has the last { on the line

    if (prevStartLineIndex < deletedLines.length - 1) {
        balance += deletedLines
            .slice(prevStartLineIndex + 1)
            .map(l => countOccurences(l, "{"))
            .reduce((s, x) => s += x);
    }

    while (currentLineIndex >= 0) {
        if (balance == 1 && hasBlockOpeningInTheEnd(addedLines[currentLineIndex])) {
            return currentLineIndex;
        }

        const balanceDelta = countBlockBalance(addedLines[currentLineIndex]);
        currentLineIndex -= 1;

        balance -= balanceDelta;
    }

    return undefined;
}

function findNewBlockEnd(deletedLines: string[], addedLines: string[], prevEndLineIndex: number) {
    let currentLineIndex = 0;

    let balance = -1; // suppose that block has the first } on the line

    if (prevEndLineIndex > 0) {
        balance += deletedLines
            .slice(0, prevEndLineIndex)
            .map(l => countOccurences(l, "{"))
            .reduce((s, x) => s += x);
    }

    while (currentLineIndex <= addedLines.length - 1) {
        if (balance == -1 && hasBlockClosingInTheStart(addedLines[currentLineIndex])) {
            return currentLineIndex;
        }

        const balanceDelta = countBlockBalance(addedLines[currentLineIndex]);
        currentLineIndex += 1;

        balance -= balanceDelta;
    }

    return undefined;
}

function hasBlockClosingInTheStart(line: string) {
    const index = line.indexOf("}");
    return index > -1 && (index < line.indexOf("{") || line.indexOf("{") === -1);
}


function hasBlockOpeningInTheEnd(line: string) {
    const index = line.lastIndexOf("{");
    return index > -1 && (index > line.lastIndexOf("}") || line.lastIndexOf("}") === -1);
}

function countBlockBalance(line: string) {
    return countOccurences(line, "{") - countOccurences(line, "}");
}


class FileBlocksTracker {
    private _blocks: IBlock[];

    constructor(blocks: IBlock[]) {
        this._blocks = blocks.sort((a, b) => a.startLine - b.startLine);
    }

    public applyChunks(chunks: IChunk[]): IBlockChange[] {
        const result: IBlockChange[] = [];
        let curBlockIndex = 0;
        let curBlock = this._blocks[curBlockIndex];

        for (const chunk of chunks) {

            const prevChunkLength = chunk.deletedLines.length;
            const newChunkLength = chunk.addedLines.length;

            if (chunk.start < curBlock.startLine) {

                if (chunk.start + prevChunkLength - 1 >= curBlock.startLine) {

                    const newBlockStartline = chunk.start + findNewBlockStart(chunk.deletedLines, chunk.addedLines, curBlock.startLine - chunk.start);
                    const startDelta = newBlockStartline - curBlock.startLine;

                    result.push({
                        startDelta,
                        endDelta: newChunkLength - prevChunkLength - startDelta
                    });
                } else {
                    // [OK] ignore pre-block change
                }
            }

            if (chunk.start > curBlock.startLine && chunk.start + prevChunkLength - 1 < curBlock.endLine) {
                result.push(
                    {
                        startDelta: chunk.newStart - chunk.start,
                        endDelta: newChunkLength - prevChunkLength
                    }
                );
            }
        }

        return result;
    }

    public applyPatch(fileChunks: IChunk[]) {
        var addedlinesIndex = 0;
        for (var block of this._blocks) {

        }
    }

    public getBlocks(): IBlock[] {
        return this._blocks;
    }
}

export {
    IChunk,
    IBlockChange,
    FileBlocksTracker,
    findNewBlockStart,
    findNewBlockEnd,
    countBlockBalance
}
