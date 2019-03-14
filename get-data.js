const simpleGit = require('simple-git');
const async = require('async');
const Octokit = require('@octokit/rest');
const octokit = new Octokit ();
const workingDirecotory = 'sandbox/DevExtreme';
const git = simpleGit(workingDirecotory);

const repoUrl = 'https://github.com/DevExpress/DevExtreme';
const [ repoOwner, repoName ] = repoUrl.replace('https://github.com/', '').split('/');

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

module.exports = () => {
    const files = {};

    return new Promise((resolve, reject) => {
        const now = new Date();
        const endDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} 23:59`;

        getPulls().then((pullsRegistry) => {
            git.log({
                '--after': '2019-01-01 00:00',
                '--before': endDate
            }, (_, commits) => {
                async.each(commits.all, (commit, callback) => {
                    // TODO: Try to find by merge_commit_sha
                    const parseTitle = commit.message.match(/\(#(\d+)\)/);
                    const prId = parseTitle && parseTitle[1];
                    const pullData = pullsRegistry[prId];
                    const pull;

                    if(pullData) {
                        pull = {
                            labels: pullData.labels.map(label => label.name),
                            title: pullData.title,
                            body: pullData.body
                        };
                    }
                    
                    git.show([ commit.hash ], (_, raw) => {
                        const rawCommitFiles = raw.split('diff --git a/').splice(1);
                        rawCommitFiles.forEach((rawFileChanges) => {
                            const fileName = rawFileChanges.substr(0, rawFileChanges.indexOf(' '));
                            if(!files[fileName]) {
                                files[fileName] = [];
                            }
    
                            const fileCommits = files[fileName];
                            const additions = rawFileChanges.match(/^\+[^+]/gm);
                            const deletions = rawFileChanges.match(/^\-[^-]/gm);

                            fileCommits.push({
                                date: commit.date,
                                additions: additions ? additions.length : 0,
                                deletions: deletions ? deletions.length : 0,
                                author: commit.author_name,
                                email: commit.author_email,
                                hash: commit.hash,
                                title: commit.message,
                                pull
                            });
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
