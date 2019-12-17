const AWS = require('aws-sdk');
const fs = require('fs');
const winston = require('../winston');

//const filePath = './data/downloaded.json';
//const bucketName = 'your.bucket.name';
//const key = 'data/data.json';

var s3 = new AWS.S3({ accessKeyId: process.env.S3_DOWNLOAD_ACCESS_KEY, secretAccessKey: process.env.S3_DOWNLOAD_ACCESS_SECRET });
const downloadFile = async (filePath, bucketName, key, fileName, fileType) => {

    const params = {
        Bucket: bucketName,
        Key: key,
    };
    winston.debug("Downloading from S3", params)
    await s3.getObject(params)
    .promise()
    .then(function(data){
        fs.writeFileSync(filePath+"/"+fileName, data.Body);
        winston.debug(`${fileName} has been created at ${filePath}`);
        return fileName;
    })
    .catch((err) => {
        winston.error(err.toString());
        throw `${err.code} : ${err.message}`;
    });
};

module.exports.downloadFile = downloadFile;

/*
        AWS.config.getCredentials(function(err) {
        if (err) console.log(err);
        // credentials not loaded
        else {
          console.log("Access key:", AWS.config.credentials.accessKeyId);
          console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
        }
      });
*/