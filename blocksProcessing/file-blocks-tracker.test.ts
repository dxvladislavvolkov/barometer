import { IBlock } from "./block";
import { IChunk, FileBlocksTracker, ILinesDelta } from "./file-blocks-tracker";

describe("file-blocks-tracker", () => {

    it("sorts blocks", () => {
        const blocks: IBlock[] = [
            {
                name: undefined,
                startLine: 3,
                endLine: 6
            },
            {
                name: undefined,
                startLine: 1,
                endLine: 2
            },
            {
                name: undefined,
                startLine: 8,
                endLine: 12
            }
        ];

        const tracker = new FileBlocksTracker(blocks);

        expect(tracker.getBlocks()).toEqual([
            {
                name: undefined,
                startLine: 1,
                endLine: 2
            },
            {
                name: undefined,
                startLine: 3,
                endLine: 6
            },
            {
                name: undefined,
                startLine: 8,
                endLine: 12
            }]);
    });

    describe("chunks processing", () => {

        it("updates block start accroding to chunk newStart", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const chunks: IChunk[] = [
                {
                    start: 9,
                    newStart: 109,
                    deletedLines: new Array(3),
                    addedLines: new Array(3)
                }
            ];

            const actual = new FileBlocksTracker(blocks).splitChunks(chunks);

            const expected: ILinesDelta[] = [
                {
                    startDelta: 100,
                    endDelta: 0
                }
            ];

            expect(actual).toEqual(expected);
        });

        it("throughs away pre-block change", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const chunks: IChunk[] = [
                {
                    start: 4,
                    newStart: 4,
                    deletedLines: new Array(4),
                    addedLines: new Array(100)
                }
            ];

            const actual = new FileBlocksTracker(blocks).splitChunks(chunks);

            expect(actual).toEqual([]);
        });

        // it("detects moved block start", () => {
        //     const blocks: IBlock[] = [
        //         {
        //             name: undefined,
        //             startLine: 8,
        //             endLine: 12
        //         }
        //     ];

        //     const chunks: IChunk[] = [
        //         {
        //             start: 4,
        //             prevLength: 7,
        //             newLength: 9
        //         }
        //     ];

        //     const actual = new FileBlocksTracker(blocks).splitChunks(chunks);

        //     const expected: ILinesDelta[] = [
        //         {
        //             start: 4,
        //             delta: 4
        //         },
        //         {
        //             start: 8,
        //             delta: +2
        //         }
        //     ];

        //     expect(actual).toEqual(expected);
        // });

        it("keep in-block change", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const chunks: IChunk[] = [
                {
                    start: 9,
                    newStart: 9,
                    deletedLines: new Array(3),
                    addedLines: new Array(100)
                }
            ];

            const actual = new FileBlocksTracker(blocks).splitChunks(chunks);

            const expected: ILinesDelta[] = [
                {
                    startDelta: 0,
                    endDelta: 97
                }
            ];

            expect(actual).toEqual(expected);
        });

        it("keep in-block change (zero delta)", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const chunks: IChunk[] = [
                {
                    start: 9,
                    newStart: 9,
                    deletedLines: new Array(3),
                    addedLines: new Array(3)
                }
            ];

            const actual = new FileBlocksTracker(blocks).splitChunks(chunks);

            const expected: ILinesDelta[] = [
                {
                    startDelta: 0,
                    endDelta: 0
                }
            ];

            expect(actual).toEqual(expected);
        });

        it("throughs away pre-block change", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const chunks: IChunk[] = [
                {
                    start: 13,
                    newStart: 13,
                    deletedLines: new Array(100),
                    addedLines: new Array(0)
                }
            ];

            const actual = new FileBlocksTracker(blocks).splitChunks(chunks);

            expect(actual).toEqual([]);
        });

    })




    // it("adds lines to block", () => {
    //     const blocks: IBlock[] = [
    //         {
    //             name: "block1",
    //             startLine: 3,
    //             endLine: 6
    //         }
    //     ];

    //     const patch: IChunk[] = [{

    //         addedLines: [4, 5],
    //         deletedLines: undefined
    //     }];

    //     const tracker = new FileBlocksTracker(blocks);

    //     tracker.applyPatch(patch);

    //     expect(tracker.getBlocks()).toEqual([
    //         {
    //             name: "block1",
    //             startLine: 3,
    //             endLine: 8
    //         }
    //     ]);
    // });

});
