const simpleGit = require('simple-git');
const async = require('async');
const workingDirecotory = 'sandbox/DevExtreme';
const git = simpleGit(workingDirecotory);

const files = {};

module.exports = () => {
    return new Promise((resolve, reject) => {
        const date = new Date();
        const endDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
        git.log({
            '--after': '2019-01-01 00:00',
            '--before': endDate
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
                            changes: 1
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
