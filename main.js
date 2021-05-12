
const express = require('express');
const ethers = require('ethers');
const { fmarsStats } = require('./token');
const app = express();



const toCamelCase = (key) => {
    const arr = key.split('-');
    let k = '';
    let i = 0;
    for (const part of arr) {
        const p = (i++)
            ? part.charAt(0).toUpperCase() + part.substr(1)
            : part;

        k = `${k}${p}`
    }
    return k;
}



app.get('/:key', async (req, res) => {
    try {
        const stats = await fmarsStats();
        console.log(toCamelCase(req.params.key));
        const value = stats[toCamelCase(req.params.key)];
        res.send(`${value}`);   
    }
    catch (e) {
        res.status(500).send('SERVER ERROR');
        return;
    }
});


app.listen(80, () => {
    console.group(`listening on port 80..`);
});

