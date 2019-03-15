const simpleGit = require('simple-git');
const async = require('async');
const Octokit = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
const octokit = new Octokit ();

const GO_DEEPER = false;

const repoUrl = 'https://github.com/DevExpress/DevExtreme';
const [ repoOwner, repoName ] = repoUrl.replace('https://github.com/', '').split('/');

const workingDirecotory = `sandbox/${repoName}`;
const git = simpleGit(workingDirecotory);

const getPullsByPage = (page) => {
    return octokit.search.issuesAndPullRequests({
        q: `type:pr state:closed is:merged repo:${repoOwner}/${repoName}`,
        per_page: 100,
        page
    });
};

const getPulls = () => {
    const pullsRegistry = {};
    const registerPulls = (pulls) => {
        pulls.forEach(pull => {
            pullsRegistry[pull.number] = pull;
        });
    };

    return new Promise((resolve, reject) => {
        // TODO: Solve rate limit
        resolve({});
        return;
        getPullsByPage(1).then((pulls) => {
            registerPulls(pulls.data.items);
            const pagesCount = Math.ceil(pulls.data.total_count / 100);
            let pageIndex = 2;
            async.until(() => pageIndex > pagesCount, (callback) => {
                getPullsByPage(pageIndex).then((pulls) => {
                    registerPulls(pulls.data.items);
                    callback();
                });
                pageIndex++;
            }, () => {
                resolve(pullsRegistry);
            });
        });
    });
};

module.exports = (withFixes) => {
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
        getPulls().then((pullsRegistry) => {
            git.log({
                '--after': '2019-01-01 00:00',
                '--before': endDate
            }, (_, commits) => {
                async.each([commits.all[1]], (commit, callback) => {
                    const parseTitle = commit.message.match(/\(#(\d+)\)/);
                    const prId = parseTitle && parseTitle[1];
                    const pullData = pullsRegistry[prId];
                    let pull;

                    if(pullData) {
                        pull = {
                            labels: pullData.labels.map(label => label.name),
                            title: pullData.title,
                            body: pullData.body
                        };
                    }
                    
                    git.show([ commit.hash, '--unified=0' ], (_, raw) => {
                        const rawCommitFiles = raw.split('diff --git a/').splice(1);
                        rawCommitFiles.forEach((rawFileChanges) => {
                            const fileName = rawFileChanges.substr(0, rawFileChanges.indexOf(' '));
                            if(!files[fileName]) {
                                files[fileName] = [];
                            }

                            if(GO_DEEPER) {
                                fs.readFile(path.join(workingDirecotory, fileName), "utf8", (err, fileContent) => {
                                    const fileChangesInfo = {
                                        fileName,
                                        fileContent,
                                        changes: rawFileChanges.split(/^@@\s+-/m).splice(1).map((rawBlock) => {
                                            const [ rawPositions, rawChanges ] = rawBlock.split(/ @@ [^\n]+\n/m);
                                            const [, deletionPos, deletionLength, additionPos, additionLength ] = rawPositions.match(/^(\d+),?(\d*)\s+\+(\d+),?(\d*)$/);
            
                                            const changesList = rawChanges.split(/\n/m);
                                            return {
                                                deletionPos: ~~deletionPos,
                                                deletionLength: deletionLength ? ~~deletionLength : 1,
                                                additionPos: ~~additionPos,
                                                additionLength: additionLength ? ~~additionLength : 1,
                                                additions: changesList.filter(line => line.match(/^\+[^+]/)).map(line => line.substr(1)),
                                                deletions: changesList.filter(line => line.match(/^\-[^-]/)).map(line => line.substr(1))
                                            };
                                        })
                                    };

                                    // TODO: process by Ilya
                                });
                            } else {
                                const fileCommits = files[fileName];

                        const additions = rawFileChanges.match(/^\+[^+]/gm);
                        const deleteons = rawFileChanges.match(/^\-[^-]/gm);

                        if(withFixes) {
                            if(/(Fix(es)?)|(fix(es)?)|(T\d{6})/.test(commit.message)) {
                                fileCommits.push({
                                    date: commit.date,
                                    additions: additions ? additions.length : 0,
                                    deleteons: deleteons ? deleteons.length : 0,
                                    author: commit.author_name,
                                    email: commit.author_email,
                                    hash: commit.hash
                                });
                            }
                        } else {
                            fileCommits.push({
                                date: commit.date,
                                additions: additions ? additions.length : 0,
                                deleteons: deleteons ? deleteons.length : 0,
                                author: commit.author_name,
                                email: commit.author_email,
                                hash: commit.hash
                            });
                        }
                            }
                        });
                        callback();

                    });
                }, () => {
                    resolve(files);
                });
            });
        });
    })
};
