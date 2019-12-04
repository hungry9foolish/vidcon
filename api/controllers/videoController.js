//const winston = require('../winston');
const appRoot = require('app-root-path');
const path = require('path');
const s3Video = require('../models/s3Video');
const s3Downloader = require('../../s3Handler/s3Downloader');
const ConverterFactory = require('../../converter/converterFactory');
const bundler = require('../../bundle');
const uploader = require('../../s3Handler/s3Uploader');
const Converter = require('../../converter/Converter');
const winston = require('../../winston');

const createVideoFromS3 = async (req, res) => {
    const fileLocation = `${appRoot.path}/videos`;
    let fileName = path.basename(req.body.key);
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
    await uploadPackage(req, fileLocation, fileName)
    .then((data)=> {
        winston.info(`Uploaded : ${data.Location}`);
        response = {...response, uploaded: data.Location};
    })
    .catch((err)=>{
        response = {...response, uploaded: err.toString()}
    })

    res.send(response);
}

const convertVideo = async function (fileLocation, fileName) {    
    return await Promise.all([
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().HLS, fileName, fileLocation).convert(),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().DASH, fileName, fileLocation).convert(),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().MP4, fileName, fileLocation).convert()
    ]);
}

const uploadPackage = function(req, fileLocation, fileName){
    let s3DownloadKey = req.body.key;
    let s3DownloadBucket = req.body.bucket;
    let s3Location = path.dirname(s3DownloadKey);
    s3Location = s3Location.startsWith(".") ? s3Location.substring(1) : s3Location;
    let s3FileName = path.basename(s3DownloadKey, path.extname(s3DownloadKey));
    let s3UpoadKey = s3Location == ""? `${s3FileName}.zip`:`${s3Location}/${s3FileName}.zip`;
    winston.info(`Uploading ${s3DownloadBucket}/${s3UpoadKey}`);
    return uploader(s3UpoadKey, s3DownloadBucket, `${fileLocation}/${fileName}`);
}

module.exports = createVideoFromS3;