import {
    readdirSync,
    readFileSync,
    writeFileSync
} from "fs";
import { sync as deleteSync } from "del";
import { join as joinPaths } from "path";

import { discover as discoverBlocks } from "./block-discoverer";

const targetDir = './blocksProcessing/test/';
const outputFilesExt = ".blocks.json";

deleteSync(joinPaths(targetDir, `*${outputFilesExt}`));

readdirSync('./blocksProcessing/test/').forEach(fileName => {
    const text = readFileSync(joinPaths(targetDir, fileName)).toString();
    const blocks = discoverBlocks(text);

    const blocksFileName = fileName.substring(0, fileName.lastIndexOf(".")) + outputFilesExt;

    const result = {
        fileLinesCount: text.split("\n").length,
        blocksLinesCount: blocks
            .map(b => b.endLine - b.startLine + 1)
            .reduce( (s, x) => s += x),
        blocks
    }

    writeFileSync(joinPaths(targetDir, blocksFileName), JSON.stringify(result, null, 2));
    console.log(blocksFileName);
});
