const simpleGit = require('simple-git');
const fs = require('fs');

const repoUrl = 'https://github.com/DevExpress/DevExtreme';
const workingDirecotory = 'sandbox';

if (!fs.existsSync(workingDirecotory)){
    fs.mkdirSync(workingDirecotory);
}

const git = simpleGit(workingDirecotory);

git.clone(repoUrl, (err) => {
   console.log(err || 'done'); 
});