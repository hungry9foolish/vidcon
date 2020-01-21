const fs = require('fs');
const path = require('path');
const s3Uploader = require("./s3Uploader");
const winston = require('../winston');
// List all files in a directory in Node.js recursively in a synchronous fashion
const walkSync = function(dir, filelist) {
    let files = recursiveWalkSync(dir);
    const baseName = path.basename(dir);
    files = files.map(x => x.replace(dir + "/", baseName + "/"));
    return files;
};

const recursiveWalkSync = function(dir, filelist){
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
        filelist = recursiveWalkSync(dir + '/' + file, filelist);
        }
        else {
        filelist.push(dir + '/' + file);
        }
    });
    return filelist;
};

const s3FolderUploader = async function(dir, s3BaseKey, bucket){
    const filelist = walkSync(dir);
    return asyncFileUpload(filelist, s3BaseKey, bucket, dir);
};

const asyncFileUpload = async function(filelist, s3BaseKey, bucket, dir){    
    const baseDirName = path.dirname(dir);
    return await filelist.forEach(x => {
        let key = s3BaseKey;
        key = key ? `${key}/${x}` : x;
        s3Uploader(key, bucket, `${baseDirName}/${x}`)
        .catch(err => {
            winston.error(`Could not upload ${s3BaseKey}/${x}, ${JSON.stringify(err)}`);
        });
    });
}

  module.exports = s3FolderUploader;