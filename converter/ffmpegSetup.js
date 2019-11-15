/**
 * Usage from console
 * npm run-script run -- --fileName <FileName with extension> --targetExtension <Extension to convert to>
 */

const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const os = require('os');
var fs = require('fs');
const winston = require('../winston');

const args = require('minimist')(process.argv.slice(2));

const initialize = function () {
    if (os.platform() == 'win32') {
        let binarypath = path.resolve('./ffmpeg/bin/');
        let ffmpegpath = path.join(binarypath, 'ffmpeg.exe');

        try {
            var FfmpegPathInfo = fs.statSync(ffmpegpath);
        } catch (err) {
            throw err;
        }

        ffmpeg.setFfmpegPath(ffmpegpath);
        ffmpeg.setFfprobePath(path.join(binarypath, 'ffprobe.exe'));

        winston.debug(`binarypath ${ffmpegpath}`);
    }
    return ffmpeg;
}

module.exports = initialize;