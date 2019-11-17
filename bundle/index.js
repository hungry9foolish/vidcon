const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const winston = require('../winston');

const bundler = function (outputLocation, fileName) {
    fileName = path.basename(fileName, path.extname(fileName));
    const outLoc = `${outputLocation}/${fileName}`;
    var outputStream = fs.createWriteStream(`${outLoc}.zip`);

    var archive = archiver('zip', { zlib: { level: 9 } });
    return new Promise((resolve, reject) => {
        archive
            .directory(`${outLoc}`, false)
            .on('error', err => reject(err))
            .pipe(outputStream);

        outputStream.on('close', () => {
            winston.info(`Bundled ${outLoc}.zip`);
            resolve(`${outLoc}.zip`);
        });
        archive.finalize();
    });
}

module.exports = bundler;


//ref : https://stackoverflow.com/a/18775083