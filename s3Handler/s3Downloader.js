const AWS = require('aws-sdk');
const fs = require('fs');

//const filePath = './data/downloaded.json';
//const bucketName = 'your.bucket.name';
//const key = 'data/data.json';

var s3 = new AWS.S3({ accessKeyId: process.env.S3_DOWNLOAD_ACCESS_KEY, secretAccessKey: process.env.S3_DOWNLOAD_ACCESS_SECRET });
const downloadFile = (filePath, bucketName, key) => {


    const params = {
        Bucket: bucketName,
        Key: key
    };
    const remoteFilePath = key.split('/');
    const fileName = remoteFilePath[remoteFilePath.length-1];
    s3.getObject(params, (err, data) => {
        console.log(err);
        if (err){
            throw `${err.code} : ${err.message}`;
        }
        else{
            fs.writeFileSync(filePath+"/"+fileName, data.Body);
            console.log(`${fileName} has been created at ${filePath}`);
        }
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