const simpleGit = require('simple-git');
const async = require('async');
const workingDirecotory = 'sandbox/DevExtreme';
const git = simpleGit(workingDirecotory);

const files = {};

module.export = () => {
    return new Promise((resolve, reject) => {
        git.log({
            '--after': '2019-03-01 00:00',
            '--before': '2019-03-14 23:59'
        }, (err, result) => {
            async.each(result.all, (commit, callback) => {
                git.show([ commit.hash ], (err, result) => {
                    result.replace(/diff --git a\/(\S+)[^\n]*/gm, (_, fileName) => {
                        if(!files[fileName]) {
                            files[fileName] = [];
                        }

                        const fileCommits = files[fileName];

                        fileCommits.push({
                            date: commit.date,
                            changes: 40
                        });
                    })
                    callback();
                });
            }, () => {
                resolve(files);
            });
        });
    })
};
