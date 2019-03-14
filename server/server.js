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

const readData = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('data.json', (err, res) => {
            cachedData = res.toString();
            resolve('data cashed');
        });
    });
};

const updateData = () => {
    return new Promise((resolve, reject) => {
        getData().then((data) => {
            fs.writeFile(`data.json`, JSON.stringify(data, null, ' '), ()=>{
                readData().then(() => {
                    resolve('data updated')
                });
            });
        });
    });
};

app.use(cors(corsOptions));

app.get('/updateData', (req, res) => {
    updateData().then((r) => {
        res.send(r);
    });
});

app.get('/getData', (req, res) => {
    readData().then(() => {
        if(!cachedData) {
            updateData().then((r) => {
                res.send(cachedData);
            });
        } else {
            res.send(cachedData);
        }
    });    
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
