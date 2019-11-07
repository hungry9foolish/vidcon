const s3Video = require('../models/s3Video');
const s3Downloader = require('../../s3Handler/s3Downloader');

const createVideoFromS3 = function(req, res){
    console.log(req.body.bucket);
    try{
        s3Downloader.downloadFile("./videos", req.body.bucket, req.body.key);
    }
    catch(err){
        res.send(err);
    }
}

module.exports = createVideoFromS3;