const winston = require("../winston");

const STATUSES = {
    UNKNOWN: "unknown",
    STARTED: "started",
    COMPLETED: "completed",
    ERROR: "error",
};

const FILE_TYPES = {
    HLS: "hls",
    DASH: "dash",
    MP4: "mp4",
}

class StatusMonitor{    
    constructor(inputFileType){
        this.inputFileType = inputFileType;
        this.meta = {
            statuses: Object.keys(STATUSES).map(x => STATUSES[x]),
            outputFileTypes: Object.keys(FILE_TYPES).map(x => FILE_TYPES[x]),
        }
        Object.keys(FILE_TYPES).forEach(x => {
            const typeStatusString = `${FILE_TYPES[x]}Status`;
            this[typeStatusString] = STATUSES.UNKNOWN;
        });
    }

    updateStatus(fileType, status){
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

    serializeStatus(){
        const status = JSON.stringify(this);
        
    }
}

module.exports = StatusMonitor;