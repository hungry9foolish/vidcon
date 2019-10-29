const AWS = require('aws-sdk');
const fs = require('fs');

const filePath = './data/downloaded.json';
const bucketName = 'your.bucket.name';
const key = 'data/data.json';

var s3 = new AWS.S3();

const downloadFile = (filePath, bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };
  s3.getObject(params, (err, data) => {
    if (err) console.error(err);
    fs.writeFileSync(filePath, data.Body.toString());
    console.log(`${filePath} has been created!`);
  });
};

downloadFile(filePath, bucketName, key);

module.exports.downloadFile = downloadFile;