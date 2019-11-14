const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('./winston');
const router = require('./api/router');


const app = express();
app.use(bodyParser.json());
app.use(morgan('dev', { stream: winston.stream }));
const port = 5000;

app.use('/', router);

app.listen(port, () => console.log(`Starting server at port# ${port}`));

