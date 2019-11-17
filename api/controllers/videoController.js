//const winston = require('../winston');
const appRoot = require('app-root-path');
const s3Video = require('../models/s3Video');
const s3Downloader = require('../../s3Handler/s3Downloader');
const ConverterFactory = require('../../converter/converterFactory');
const bundler = require('../../bundle');
const Converter = require('../../converter/Converter');
const winston = require('../../winston');

const createVideoFromS3 = async (req, res) => {
    const fileLocation = `${appRoot.path}/videos`;
    let response = {};

    //Download file
    winston.info(`Downloading file ${req.body.key}`);
    await s3Downloader.downloadFile(fileLocation, req.body.bucket, req.body.key)
    .catch((err)=>{
        const error = `Could not download ${req.body.bucket}/${req.body.key}`;
        winston.error(error);
        winston.error(err.toString());
        response = {download: error, error: err.toString()};
    })
    .then(()=>{
        let logMessage = `Succesfully downloaded ${req.body.bucket}/${req.body.key}`;
        winston.info(logMessage);
        response = {...response, download: logMessage}
    });

    //Convert file
    let fileName = req.body.key.split("/");
    fileName = fileName[fileName.length-1];

    winston.info(`Converting file ${fileName} at ${fileLocation}`);
    await convertVideo(fileLocation, fileName)
    .catch(function (err) {
        response = {
            err: err.toString(),
            stack: err.stack
        };
    })                    
    .then(() => {
        let logMessage = `${fileName} was successfully converted`;
        winston.info(logMessage);
        response = {...response, convert: logMessage };
    })

    //Create zip package
    const bundle = `${fileLocation}/${fileName}`;
    winston.info(`Bundling : ${bundle}`);
    await bundler(fileLocation, fileName)
    .then(response = {...response, bundle: `Creadted bundle for ${fileName}`});

    //Upload Package

    res.send(response);
}

const convertVideo = async function (fileLocation, fileName) {    
    return await Promise.all([
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().HLS, fileName, fileLocation).convert(),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().DASH, fileName, fileLocation).convert(),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().MP4, fileName, fileLocation).convert()
    ]);
}

module.exports = createVideoFromS3;