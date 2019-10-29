class s3Video{
    constructor(fileKey,bucket){
        this.fileKey = fileKey;
        this.bucket=bucket;
        //will extend if needed
    }
}

module.exports = s3Video;