//const winston = require('../winston');
const appRoot = require('app-root-path');
const path = require('path');
const s3Video = require('../models/s3Video');
const s3Downloader = require('../../s3Handler/s3Downloader');
const ConverterFactory = require('../../converter/converterFactory');
const bundler = require('../../bundle');
const uploader = require('../../s3Handler/s3Uploader');
const folderUploader = require('../../s3Handler/s3FolderUploader');
const Converter = require('../../converter/Converter');
const winston = require('../../winston');

const createVideoFromS3 = async (req, res) => {    
    const bucket = req.body.bucket;
    const uploadBaseKey = req.body.uploadBaseKey;
    const key = req.body.key;
    const fileType = req.body.fileType;
    const fileLocation = `${appRoot.path}/videos`;
    let fileName = path.basename(key);
    fileName = getFileName(fileName, fileType);
    let response = {};

    //Download file
    winston.info(`Downloading file ${key}`);
    await s3Downloader.downloadFile(fileLocation, bucket, key, fileName,  fileType)
    .catch((err)=>{
        const error = `Could not download ${bucket}/${key}`;
        winston.error(error);
        winston.error(err.toString());
        response = {download: error, error: err.toString()};
    })
    .then(()=>{
        let logMessage = `Succesfully downloaded ${bucket}/${key}`;
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

    //Upload Package
    const directoryToUpload = `${fileLocation}/${key}`;
    await folderUploader(directoryToUpload, uploadBaseKey, bucket)    
    .then(()=> {
        let uploadLocation = bucket;
        uploadLocation = uploadBaseKey ? `${uploadLocation}/${uploadBaseKey}` : uploadLocation;
        uploadLocation = `${uploadLocation}/${key}`;
        winston.debug(`Uploaded : ${uploadLocation}`);
        response = {...response, uploaded: uploadLocation};
    })
    .catch((err)=>{
        response = {...response, uploaded: err.toString()}
    });

    res.send(response);
}

const convertVideo = async function (fileLocation, fileName) {    
    return await Promise.all([
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().HLS, fileName, fileLocation).convert(),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().DASH, fileName, fileLocation).convert(),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().MP4, fileName, fileLocation).convert()
    ]);
}

const getFileName = function(fileName, fileType){
    if(!fileType){
        return fileName;
    }
    const fileExt = path.extname(fileName);
    if(!fileExt){
        fileName = fileName + "." + fileType;
    }
    //if the downloaded file already has an extension don't change it

    return fileName;
}



module.exports = createVideoFromS3;