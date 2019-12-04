const express = require('express');
const createVideoFromS3 = require('./controllers/videoController');
const healthCheck = require('./controllers/healthCheck');

const router = express.Router();
router.get('/healthCheck', (req, res)=>healthCheck(req, res));
router.post('/videos', (req, res)=>createVideoFromS3(req, res));


module.exports = router;