const AWS = require('aws-sdk');
const fs = require('fs');

var s3 = new AWS.S3({ accessKeyId: process.env.S3_DOWNLOAD_ACCESS_KEY, secretAccessKey: process.env.S3_DOWNLOAD_ACCESS_SECRET });
const uploader = async (s3Key, bucket, fileName) => {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);

    // Setting up S3 upload parameters
    const params = {
        Bucket: bucket,
        Key: s3Key, // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    return await s3.upload(params)
    .promise();
};

module.exports = uploader;