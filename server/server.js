const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const data = require('../data.json');
const getData = require('../get-data');

const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
};

const cacheData = () => {
    getData().then((data) => {
        fs.writeFile(`data.json`, JSON.stringify(data, null, ' '), ()=>{});
    });
};

app.use(cors(corsOptions));

app.get('/updateData', (req, res) => {
    cacheData();
    res.send('done');
});

app.get('/getData', (req, res) => {
    res.send(data);
});

app.listen(1234, () => {
    console.log('barometr host');
});
