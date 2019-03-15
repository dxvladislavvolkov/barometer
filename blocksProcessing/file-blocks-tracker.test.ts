import { IBlock } from "./block";
import {
    IChunk,
    FileBlocksTracker,
    IBlockChange,
    countBlockBalance,
    findNewBlockStart,
    findNewBlockEnd
} from "./file-blocks-tracker";

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

    describe("block moved boundaries detection", () => {

        it("counts block balance", () => {
            expect(countBlockBalance("{asdaasd}{sdsd")).toBe(1);
            expect(countBlockBalance("{asdaasd}{sds{d{")).toBe(3);
            expect(countBlockBalance("{asdaasd}{sds{d{}}}}}")).toBe(-2);
            expect(countBlockBalance("{asdaasd}}{sds{d{}}}")).toBe(-1);
        });

        describe("block start", () => {

            it("finds block new start (first -> first)", () => {
                const newBlockStartLineIndex = findNewBlockStart(
                    [
                        "var t = { a: function() {",
                        "const y = 1;"
                    ],
                    [
                        "a: function() {",
                        "const y = 2;"
                    ],
                    0
                );

                expect(newBlockStartLineIndex).toBe(0);
            });

            it("finds block new start (first -> center)", () => {
                const newBlockStartLineIndex = findNewBlockStart(
                    [
                        "var t = { a: function() {",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "var t = { ",
                        "a: function() {",
                        "const y = 2;"
                    ],
                    0
                );

                expect(newBlockStartLineIndex).toBe(4);
            });

            it("finds block new start (first -> last)", () => {
                const newBlockStartLineIndex = findNewBlockStart(
                    [
                        "var t = { a: function() {",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "var t = { ",
                        "a: function() {"
                    ],
                    0
                );

                expect(newBlockStartLineIndex).toBe(4);
            });

            it("finds block new start (center -> center)", () => {
                const newBlockStartLineIndex = findNewBlockStart(
                    [
                        "const x = 1;",
                        "var t = { a: function() {",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "var t = { ",
                        "a: function() {",
                        "const y = 2;"
                    ],
                    1
                );

                expect(newBlockStartLineIndex).toBe(4);
            });

            it("finds block new start (center -> last)", () => {
                const newBlockStartLineIndex = findNewBlockStart(
                    [
                        "const x = 1;",
                        "var t = { a: function() {",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "var t = { ",
                        "a: function() {"
                    ],
                    1
                );

                expect(newBlockStartLineIndex).toBe(4);
            });

            it("finds block new start (last -> last)", () => {
                const newBlockStartLineIndex = findNewBlockStart(
                    [
                        "const x = 1;",
                        "var t = { a: function() {"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "var t = { ",
                        "a: function() {"
                    ],
                    1
                );

                expect(newBlockStartLineIndex).toBe(4);
            });
        });

        describe("block end", () => {

            it("finds block new end (first -> first)", () => {
                const newBlockEndLineIndex = findNewBlockEnd(
                    [
                        "}, a: 1}",
                        "const y = 1;"
                    ],
                    [
                        "},",
                        "a: 1}"
                    ],
                    0
                );

                expect(newBlockEndLineIndex).toBe(0);
            });

            it("finds block new end (first -> center)", () => {
                const newBlockEndLineIndex = findNewBlockEnd(
                    [
                        "}, a: 1}",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "},",
                        "a: 1}",
                        "const y = 2;"
                    ],
                    0
                );

                expect(newBlockEndLineIndex).toBe(3);
            });

            it("finds block new end (first -> last)", () => {
                const newBlockEndLineIndex = findNewBlockEnd(
                    [
                        "}, a: 1}",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "},",
                        "a: 1}"
                    ],
                    0
                );

                expect(newBlockEndLineIndex).toBe(3);
            });

            it("finds block new end (center -> center)", () => {
                const newBlockEndLineIndex = findNewBlockEnd(
                    [
                        "const x = 1;",
                        "}, a: 1}",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "},",
                        "a: 1}",
                        "const y = 2;"
                    ],
                    1
                );

                expect(newBlockEndLineIndex).toBe(3);
            });

            it("finds block new end (center -> last)", () => {
                const newBlockEndLineIndex = findNewBlockEnd(
                    [
                        "const x = 1;",
                        "}, a: 1}",
                        "const y = 1;"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "},",
                        "a: 1}"
                    ],
                    1
                );

                expect(newBlockEndLineIndex).toBe(3);
            });

            it("finds block new end (last -> last)", () => {
                const newBlockEndLineIndex = findNewBlockEnd(
                    [
                        "const x = 1;",
                        "}, a: 1}"
                    ],
                    [
                        "const x1 = 1;",
                        "const x2 = 1;",
                        "const x3 = 1;",
                        "},",
                        "a: 1}"
                    ],
                    1
                );

                expect(newBlockEndLineIndex).toBe(3);
            });
        });

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

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 9,
                newStart: 109,
                deletedLines: new Array(3),
                addedLines: new Array(3)
            });

            expect(actual).toEqual({
                startDelta: 100,
                endDelta: 0
            });
        });

        it("throughs away pre-block change", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 4,
                newStart: 4,
                deletedLines: new Array(4),
                addedLines: new Array(100)
            });

            expect(actual).toEqual(undefined);
        });

        it("detects moved block start (neg delta)", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 4,
                newStart: 4,
                deletedLines: [
                    /* line 1 */
                    /* line 2 */
                    /* line 3 */
                    "const x1 = 1;",
                    "const x2 = 1;",
                    "const x3 = 1;",
                    "const x4 = 1;",
                    "var t = { a: function() {",
                    "const y1 = 1;",
                    "const y2 = 1;"
                    /* line 11 */
                    /* } */
                ],
                addedLines: [
                    /* line 1 */
                    /* line 2 */
                    /* line 3 */
                    "const b1 = 1;",
                    "const b2 = 1;",
                    "var t = {",
                    "a: function() {",
                    "const z2 = 1;",
                    "const z3 = 1;",
                    "const z4 = 1;",
                    "const z5 = 1;",
                    "const z6 = 1;"
                    /* line 11 */
                    /* } */
                ]
            });

            expect(actual).toEqual({
                startDelta: -1,
                endDelta: 2
            });
        });

        it("detects moved block start (neg delta)", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 4,
                newStart: 4,
                deletedLines: [
                    /* line 1 */
                    /* line 2 */
                    /* line 3 */
                    "const x1 = 1;",
                    "const x2 = 1;",
                    "const x3 = 1;",
                    "const x4 = 1;",
                    "var t = { a: function() {",
                    "const y1 = 1;",
                    "const y2 = 1;"
                    /* line 11 */
                    /* } */
                ],
                addedLines: [
                    /* line 1 */
                    /* line 2 */
                    /* line 3 */
                    "const b1 = 1;",
                    "const b2 = 1;",
                    "const z2 = 1;",
                    "const z3 = 1;",
                    "const z4 = 1;",
                    "const z5 = 1;",
                    "var t = {",
                    "a: function() {",
                    "const z6 = 1;"
                    /* line 11 */
                    /* } */
                ]
            });

            expect(actual).toEqual({
                startDelta: 3,
                endDelta: 2
            });
        });

        it("detects moved block end (neg delta)", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const deletedLines = [
                "const x1 = 1;",
                "const x2 = 1;",
                "}, a: 1}",
                "const x3 = 1;",
                "const x4 = 1;",
                "const y1 = 1;",
                "const y2 = 1;"
            ];

            const addedLines = [
                "},",
                "a: 1}",
                "const b1 = 1;",
                "const z1 = 1;",
                "const z2 = 1;",
                "const z3 = 1;",
                "const z4 = 1;",
                "const z5 = 1;",
                "const z6 = 1;"
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 10,
                newStart: 10,
                deletedLines,
                addedLines
            });

            expect(actual).toEqual({
                startDelta: 0,
                endDelta: -2
            });
        });

        it("detects moved block end (pos delta)", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 10,
                newStart: 10,
                deletedLines: [
                    "const x1 = 1;",
                    "const x2 = 1;",
                    "}, a: 1}",
                    "const x3 = 1;",
                    "const x4 = 1;",
                    "const y1 = 1;",
                    "const y2 = 1;"
                ],
                addedLines: [
                    "const b1 = 1;",
                    "const z1 = 1;",
                    "const z2 = 1;",
                    "const z3 = 1;",
                    "const z4 = 1;",
                    "const z5 = 1;",
                    "},",
                    "a: 1}",
                    "const z6 = 1;"
                ]
            });

            expect(actual).toEqual({
                startDelta: 0,
                endDelta: 4
            });
        });

        it("detects moved block start and end", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 5,
                    endLine: 8
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 3,
                newStart: 3,
                deletedLines: [
                    /* line 1 */
                    /* line 2 */
                    "const x0 = 1;",
                    "const x1 = 1;",
                    "var t = { a: function() {",
                    "const x2 = 1;",
                    "const x3 = 1;",
                    "}, a: 1}",
                    "const x4 = 1;",
                    "const y1 = 1;",
                    /* line 11 */
                ],
                addedLines: [
                    /* line 1 */
                    /* line 2 */
                    "const x0 = 1;",
                    "var t = { a: function() {",
                    "const x1 = 1;",
                    "const x2 = 1;",
                    "const x3 = 1;",
                    "}, ",
                    "a: 1}",
                    "const x4 = 1;",
                    "const x5 = 1;",
                    "const x6 = 1;",
                    "const y1 = 1;",
                    /* line 11 */

                ]
            });

            expect(actual).toEqual({
                startDelta: NaN,
                endDelta: NaN,
                isDead: true
            });
        });

        it("keep in-block change", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 9,
                newStart: 9,
                deletedLines: new Array(3),
                addedLines: new Array(100)
            });

            expect(actual).toEqual({
                startDelta: 0,
                endDelta: 97
            });
        });

        it("keep in-block change (zero delta)", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 9,
                newStart: 9,
                deletedLines: new Array(3),
                addedLines: new Array(3)
            });

            expect(actual).toEqual({
                startDelta: 0,
                endDelta: 0
            });
        });

        it("throughs away post-block change", () => {
            const blocks: IBlock[] = [
                {
                    name: undefined,
                    startLine: 8,
                    endLine: 12
                }
            ];

            const actual = new FileBlocksTracker(blocks).applyChunks({
                start: 13,
                newStart: 13,
                deletedLines: new Array(100),
                addedLines: new Array(0)
            });

            expect(actual).toEqual(undefined);
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
