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
const statusMonitor = require('../../statusMonitor');

const createVideoFromS3 = async (req, res) => {    
    const bucket = req.body.bucket;
    const uploadBaseKey = req.body.uploadBaseKey || "";
    const key = req.body.key;
    const fileType = req.body.fileType;
    const fileLocation = `${appRoot.path}/videos`;
    let fileName = path.basename(key);
    fileName = getFileName(fileName, fileType);
    let response = {};
    const statMonitor = new statusMonitor.StatusMonitor(fileType, uploadBaseKey, bucket);

    //Download file
    winston.info(`Downloading file ${key}`);
    await s3Downloader.downloadFile(fileLocation, bucket, key, fileName,  fileType)
    .catch((err)=>{
        const error = `Could not download ${bucket}/${key}`;
        winston.error(error);
        winston.error(err.toString());
        statMonitor.updateDownloadStatus(statusMonitor.STATUSES.ERROR, err.toString());
    })
    .then(()=>{
        let logMessage = `Succesfully downloaded ${bucket}/${key}`;
        winston.info(logMessage);
        statMonitor.updateDownloadStatus(statusMonitor.STATUSES.COMPLETED, logMessage);
    });

    //Convert file

    winston.info(`Converting file ${fileName} at ${fileLocation}`);
    await convertVideo(fileLocation, fileName, statMonitor)
    .catch(function (err) {
        winston.error(err.toString());
        winston.error(err.stack);
        statMonitor.updateConversionStatus(statusMonitor.STATUSES.ERROR, err.toString(), err.stack);
    })                    
    .then(() => {
        let logMessage = `${fileName} was successfully converted`;
        winston.info(logMessage);
        statMonitor.updateConversionStatus(statusMonitor.STATUSES.COMPLETED, logMessage);
    })

    //Upload Package
    const directoryToUpload = `${fileLocation}/${key}`;
    let uploadLocation = bucket;
    uploadLocation = uploadBaseKey ? `${uploadLocation}/${uploadBaseKey}` : uploadLocation;
    uploadLocation = `${uploadLocation}/${key}`;
    await folderUploader(directoryToUpload, uploadBaseKey, bucket)    
    .then(()=> {
        const message = `Successfully Uploaded - ${uploadLocation}`;
        winston.info(message);
        statMonitor.updateUploadStatus(statusMonitor.STATUSES.COMPLETED, message);
    })
    .catch((err)=>{
        const message = `Error Uploading - ${uploadLocation}, ${err.toString()}`;
        statMonitor.updateUploadStatus(statusMonitor.STATUSES.ERROR, message, err.stack);
    });

    await statMonitor.writeStatusToS3(directoryToUpload, `${uploadBaseKey}/${key}`)
    .then(() => {
        res.send(statMonitor.getStatus());
    });    
}

const convertVideo = async function (fileLocation, fileName, statMonitor) {    
    return await Promise.all([
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().HLS, fileName, fileLocation).convert(statMonitor),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().DASH, fileName, fileLocation).convert(statMonitor),
       ConverterFactory.getConverter(ConverterFactory.supportedTypes().MP4, fileName, fileLocation).convert(statMonitor)
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