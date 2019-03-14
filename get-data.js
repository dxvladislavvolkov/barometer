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
                    const rawCommitFiles = result.split('diff --git a/').splice(1);
                    rawCommitFiles.forEach((rawFileChanges) => {
                        const fileName = rawFileChanges.substr(0, rawFileChanges.indexOf(' '));
                        if(!files[fileName]) {
                            files[fileName] = [];
                        }

                        const fileCommits = files[fileName];

                        const additions = rawFileChanges.match(/^\+[^+]/gm);
                        const deleteons = rawFileChanges.match(/^\-[^-]/gm);
                        fileCommits.push({
                            date: commit.date,
                            additions: additions ? additions.length : 0,
                            deleteons: deleteons ? deleteons.length : 0
                        });
                    });
                    callback();
                });
            }, () => {
                resolve(files);
            });
        });
    })
};
