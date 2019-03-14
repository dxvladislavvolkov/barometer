const simpleGit = require('simple-git');
const fs = require('fs');

module.exports = () => {
    const repoUrl = 'https://github.com/DevExpress/DevExtreme';
    const workingDirecotory = 'sandbox';

    if (!fs.existsSync(workingDirecotory)){
        fs.mkdirSync(workingDirecotory);
    }

    const git = simpleGit(workingDirecotory);

    return new Promise((resolve, reject) => {
        git.clone(repoUrl, (err) => {
            if (err) {
                reject('Error');
            }
            resolve('done');
        });
    });
};
