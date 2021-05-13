
const express = require('express');
const { fmarsStats } = require('./token');
const app = express();
const PORT = 8000;


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
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	if (req.params.key != 'favicon.ico') {
            console.log(`[${new Date()}] ${ip}: ${toCamelCase(req.params.key)}`);
	}
        const value = stats[toCamelCase(req.params.key)];
        if (typeof value === 'undefined') {
	   throw new Exception("");
	}
	res.send(`${value}`);
    }
    catch (e) {
        res.status(500).send('SERVER ERROR');
        return;
    }
});


app.listen(PORT, () => {
    console.group(`listening on port ${PORT}..`);
});

