const winston = require("../winston");
const s3Uploader = require("../s3Handler/s3Uploader");
const fs = require("fs");

const STATUSES = {
    UNKNOWN: "unknown",
    STARTED: "started",
    COMPLETED: "completed",
    ERROR: "error",
};

const FILE_TYPES = {
    hls: "hls",
    dash: "dash",
    mp4: "mp4",
}

class StatusMonitor{    
    constructor(inputFileType, uploadBaseKey, bucket){
        this.inputFileType = inputFileType;
        this.uploadBaseKey = uploadBaseKey;
        this.bucket = bucket;
        this.meta = {
            statuses: Object.keys(STATUSES).map(x => STATUSES[x]),
            outputFileTypes: Object.keys(FILE_TYPES).map(x => FILE_TYPES[x]),
        }
        Object.keys(FILE_TYPES).forEach(x => {
            const typeStatusString = `${FILE_TYPES[x]}Status`;
            this[typeStatusString] = STATUSES.UNKNOWN;
        });
        this.uploadStatus = STATUSES.UNKNOWN;
        this.downloadStatus = STATUSES.UNKNOWN;
        this.conversiontStatus = STATUSES.UNKNOWN;
        this.uploadMessage = "";
        this.downloadMessage = "";
        this.conversionMessage = "";
        this.errorStack = "";
    }

    updateFileTypeStatus(fileType, status){
        if(!Object.values(FILE_TYPES).find(x => x == fileType)            )
        {
            winston.log("error", `Incorrect filetype ${fileType} supplied to status update function`);
        }
        if(!Object.values(STATUSES).find(x => x == status))
        {
            winston.log("error", `Incorrect filetype ${status} supplied to status update function`);
        }

        const typeStatusString = `${FILE_TYPES[fileType]}Status`;
        this[typeStatusString] = status;
    }

    updateUploadStatus(status, message, errorStack){
        if(!Object.values(STATUSES).find(x => x == status))
        {
            winston.log("error", `Incorrect filetype ${status} supplied to status update function`);
        }
        this.uploadStatus = status;
        this.uploadMessage = message;
        this.errorStack = errorStack;
    }

    updateDownloadStatus(status, message, errorStack){
        if(!Object.values(STATUSES).find(x => x == status))
        {
            winston.log("error", `Incorrect filetype ${status} supplied to status update function`);
        }
        this.uploadStatus = status;
        this.uploadMessage = message;
        this.errorStack = errorStack;
    }

    updateConversionStatus(status, message, errorStack){
        if(!Object.values(STATUSES).find(x => x == status))
        {
            winston.log("error", `Incorrect filetype ${status} supplied to status update function`);
        }
        this.conversionStatus = status;
        this.conversionMessage = message;
        this.errorStack = errorStack;
    }

    getStatus(){        
        const status = {};        
        Object.keys(FILE_TYPES).forEach(x => {
            const typeStatusString = `${FILE_TYPES[x]}Status`;
            status[typeStatusString] = this[typeStatusString];
        });        
        status.uploadStatus = this.uploadStatus;
        status.downloadStatus = this.downloadStatus;
        status.conversiontStatus = this.conversiontStatus;
        status.uploadMessage = this.uploadMessage;
        status.downloadMessage = this.downloadMessage;
        status.conversionMessage = this.conversionMessage;
        status.errorStack = this.errorStack;
        status.inputFileType = this.inputFileType;
        return status;
    }

    async writeStatusToS3(dirToUpload, s3BaseKey){
        const status = this.getStatus();
        const statusFileName = `${dirToUpload}/status.json`;
        await fs.writeFile(statusFileName, JSON.stringify(status), callbackMessage => {
            if(callbackMessage){                
                winston.error(callbackMessage.toString());
                winston.error(callbackMessage.stack);
            }
        });
        return await s3Uploader(`${s3BaseKey}/status.json`, this.bucket, statusFileName)
                .catch(err => {
                    winston.error(err.toString());
                    winston.error(err.stack);
                });
    }
}

module.exports.StatusMonitor = StatusMonitor;
module.exports.STATUSES = STATUSES;
module.exports.FILE_TYPES = FILE_TYPES;