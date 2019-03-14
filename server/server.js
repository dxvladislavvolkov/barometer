const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const getData = require('../get-data');
//const addRepo = require('../add-repo');

const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
};

const readData = (withFix) => {
    return new Promise((resolve, reject) => {
        if(withFix) {
            fs.readFile('dataWithFixes.json', (err, res) => {
                cachedData = res.toString();
                resolve('data cashed');
            });
        } else {
            fs.readFile('data.json', (err, res) => {
                cachedData = res.toString();
                resolve('data cashed');
            });
        }
        
    });
};

const updateData = (withFix) => {
    return new Promise((resolve, reject) => {
        getData(withFix).then((data) => {

            if(withFix) {
                fs.writeFile(`dataWithFixes.json`, JSON.stringify(data, null, ' '), ()=>{
                    readData().then(() => {
                        resolve('data updated')
                    });
                });
            } else {
                fs.writeFile(`data.json`, JSON.stringify(data, null, ' '), ()=>{
                    readData().then(() => {
                        resolve('data updated')
                    });
                });
            }
        });
    });
};

app.use(cors(corsOptions));

app.get('/updateData', (req, res) => {
    const withFix = req.query && req.query.withfixes;

    updateData(withFix).then((r) => {
        res.send(r);
    });
});

app.get('/getData', (req, res) => {
    const withFix = req.query && req.query.withfixes;

    if (withFix) {
        readData(withFix).then(() => {
            if(!cachedData) {
                updateData(withFix).then((r) => {
                    res.send(cachedData);
                });
            } else {
                res.send(cachedData);
            }
        }); 
    } else {
        readData(withFix).then(() => {
            if(!cachedData) {
                updateData(withFix).then((r) => {
                    res.send(cachedData);
                });
            } else {
                res.send(cachedData);
            }
        }); 
    }
});

app.get('/addRepo', (req, res) => {
    // console.log
    // addRepo().then((d)=>{
    //     updateData(() => {
    //         res.send('dane');
    //     });
    // });
});

app.listen(1234, () => {
    console.log('barometr host');
    console.log('http://localhost:1234/getdata');
    console.log('http://localhost:1234/updatedata');
});
