import { IBlock } from "./block";

interface IChunk {
    start: number;
    newStart: number;
    deletedLines: string[],
    addedLines: string[]
}

interface IBlockChange {
    startDelta: number;
    endDelta: number;
}

class FileBlocksTracker {
    private _blocks: IBlock[];

    constructor(blocks: IBlock[]) {
        this._blocks = blocks.sort((a, b) => a.startLine - b.startLine);
    }

    public splitChunks(chunks: IChunk[]): IBlockChange[] {
        const result: IBlockChange[] = [];
        let curBlockIndex = 0;
        let curBlock = this._blocks[curBlockIndex];

        for (const chunk of chunks) {

            const prevChunkLength = chunk.deletedLines.length;
            const newChunkLength = chunk.addedLines.length;

            if (chunk.start < curBlock.startLine) {

                if (chunk.start + prevChunkLength - 1 >= curBlock.startLine) {
                    const preBlockLength = curBlock.startLine - chunk.start

                    const delta = newChunkLength - prevChunkLength;

                    throw new Error("Not implemented"); // detect moved block start

                    // if (chunk.newLength > preBlockLength) {
                    //     result.push(
                    //         {
                    //             start: chunk.start,
                    //             delta: preBlockLength
                    //         },
                    //         {
                    //             start: curBlock.startLine,
                    //             delta
                    //         }
                    //     );
                    // } else {
                    //     // ??? block death ?
                    // }
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
    IBlockChange as ILinesDelta,
    FileBlocksTracker
}
