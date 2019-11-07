const express = require('express');
const createVideoFromS3 = require('./controllers/videoController');

const router = express.Router();
router.post('/videos', (req, res)=>createVideoFromS3(req, res));


module.exports = router;