//const winston = require('../winston');
const s3Video = require('../models/s3Video');
const s3Downloader = require('../../s3Handler/s3Downloader');
const ConverterFactory = require('../../converter/converterFactory');
const Converter = require('../../converter/Converter');

const createVideoFromS3 = function(req, res){
    console.log(req.body.bucket);
    try{
        
        s3Downloader.downloadFile("./videos", req.body.bucket, req.body.key);
        //new Converter().convert();
        ConverterFactory.getCoverter(ConverterFactory.supportedTypes.DASH).convert();
        ConverterFactory.getCoverter(ConverterFactory.supportedTypes.HLS).convert();
        ConverterFactory.getCoverter(ConverterFactory.supportedTypes.MP4).convert();
        res.send(`Success: ${req.body.key} was successfully downloaded`);
    }
    catch(err){
        res.send(err);
    }
}

module.exports = createVideoFromS3;