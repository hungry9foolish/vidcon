//const winston = require('../winston');
const { default: PQueue } = require('p-queue');
const appRoot = require('app-root-path');
const s3Video = require('../models/s3Video');
const s3Downloader = require('../../s3Handler/s3Downloader');
const ConverterFactory = require('../../converter/converterFactory');
const Converter = require('../../converter/Converter');
const winston = require('../../winston');

const createVideoFromS3 = async (req, res) => {
    const response = await createVideoFromS3Async(req);
    res.send(response);
}

const createVideoFromS3Async = function (req) {

    const fileLocation = `${appRoot.path}/videos`;
    let response = '';
    let err = true;
    let fileName = req.body.key;
    const queue = new PQueue({ concurrency: 1 });
    queue.add(() => s3Downloader.downloadFile(fileLocation, req.body.bucket, req.body.key));
    queue.addAll([
        () => ConverterFactory.getConverter(ConverterFactory.supportedTypes().HLS, fileName, fileLocation).convert(),
        () => ConverterFactory.getConverter(ConverterFactory.supportedTypes().DASH, fileName, fileLocation).convert()
    ])
    .then(() => {
        response = { Success: `${req.body.key} was successfully converted` };
    })
    .catch(function (err) {
        response = {
            err: err.toString(),
            stack: err.stack
        };
    });

    return new Promise((resolve, reject) => {
        if(err){
            reject(response);
        }
        else{
            resolve(response);
        }
    });

}

module.exports = createVideoFromS3;