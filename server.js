const express = require('express');
const router = require('./api/router');


const app = express();
const port = 5000;

app.use('/', router);

app.listen(port, () => console.log(`Starting server at port# ${port}`));

