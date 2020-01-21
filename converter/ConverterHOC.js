const path = require('path');
const fs = require('fs');
const appRoot = require('app-root-path');
const ffmpegInit = require('./ffmpegSetup');
const winston = require('../winston');
const statusMonitor = require('../statusMonitor');


const converterHOC = (Converter) => class {
    constructor(fileName, fileLocation) {
        this.ffmpeg = ffmpegInit();
        this.converter = new Converter();
        this.setupFileDetails(fileName, fileLocation);
        this.ffmpegProc = this.setupFFMPEGproc();
    }

    fallbackSizeBitrate() {
        return [720, 2500];
    }

    supportedSizeBitrate() {
        return [
            [240, 350],
            [480, 700],
            [720, 2500],
            [1080, 4000],];
    }

    withFallback(proc) {

        const fallback = this.fallbackSizeBitrate();
        proc
            .output(path.join(this.targetdir, `${this.filename}.mp4`))
            .format('mp4')
            .videoCodec('libx264')
            .videoBitrate(fallback[1])
            .size(`?x${fallback[0]}`)
            .audioCodec('aac')
            .audioChannels(2)
            .audioFrequency(44100)
            .audioBitrate(128)
            .outputOptions([
                '-preset veryfast',
                '-movflags +faststart',
                '-keyint_min 60',
                '-refs 5',
                '-g 60',
                '-pix_fmt yuv420p',
                '-sc_threshold 0',
                '-profile:v main',
            ]);

        return proc;
    }

    setupFFMPEGproc() {
        var proc = this.ffmpeg({
            source: this.sourcefn,
            cwd: this.targetdir
        });
        proc
            .output(this.targetfn)
            .format(this.converter.getFormatName())
            .videoCodec('libx264')
            .audioCodec('aac')
            .audioChannels(2)
            .audioFrequency(44100)
            .outputOptions([
                '-preset veryfast', //transcoding process : appropriating right amount of compute resources
                '-keyint_min 60',  //after every 60 frames there is a key screen marker is placed in the metadata of the file, small values allow for higher rendition, high file size
                '-g 60',
                '-sc_threshold 0',
                '-profile:v main',
                '-use_template 1',
                '-use_timeline 1',
                '-b_strategy 0',
                '-bf 1',
                '-map 0:a',
                '-b:a 96k'
            ]);

        proc.on('start', function (commandLine) {
            winston.debug(`Progress - Spawned Ffmpeg with command:   ${commandLine}`);
        });
        proc.on('progress', function (info) {
            winston.debug(`Progress - ${JSON.stringify(info)}`);
        }).on('end', function () {
            winston.debug('Complete');
        }).on('error', function (err) {
            winston.error(err);
        });

        const sizes = this.supportedSizeBitrate();
        for (var size of sizes) {
            let index = sizes.indexOf(size);

            proc
                .outputOptions([
                    `-filter_complex [0]format=pix_fmts=yuv420p[temp${index}];[temp${index}]scale=-2:${size[0]}[A${index}]`,
                    `-map [A${index}]:v`,
                    `-b:v:${index} ${size[1]}k`,
                ]);
        }
        return proc;
    }

    setupFileDetails(fileName, fileLocation) {
        this.targetExtension = this.converter.getExtension();
        if (!fileLocation) {
            fileLocation = appRoot.path;
        }
        else if (!path.isAbsolute(fileLocation)) {
            fileLocation = path.join(appRoot.path, fileLocation);
        }
        this.filename = path.basename(fileName, path.extname(fileName));
        this.targetdir = path.join(fileLocation,this.filename, `${this.converter.getFormatName()}`);
        this.sourcefn = path.resolve(path.join(fileLocation, fileName));
        this.targetfn = path.join(this.targetdir, `${this.filename}.${this.targetExtension}`);

        try {
            var targetdirInfo = fs.statSync(path.join(fileLocation, this.filename));
        } catch (err) {
            if (err.code === 'ENOENT') {
                fs.mkdirSync(path.join(fileLocation, this.filename));
            } else {
                throw err;
            }
        }

        try {
            var targetdirInfo = fs.statSync(this.targetdir);
        } catch (err) {
            if (err.code === 'ENOENT') {
                fs.mkdirSync(this.targetdir);
            } else {
                throw err;
            }
        }

        
    }

    convert(statMonitor) {
        const sizes = this.supportedSizeBitrate();
        winston.debug(`source: ${this.sourcefn}`);
        winston.debug('sizes', sizes);
        winston.debug(`targetDirectory: ${this.targetdir}`);
        winston.debug(`target filename: ${this.targetfn}`);
        return new Promise((resolve, reject) => {
            this.ffmpegProc.on('start', () => {
                statMonitor.updateFileTypeStatus(this.converter.getFormatName(), statusMonitor.STATUSES.STARTED);
            });
            this.ffmpegProc.on('end', ()=> {
                statMonitor.updateFileTypeStatus(this.converter.getFormatName(), statusMonitor.STATUSES.COMPLETED);
                resolve();
            });
            this.ffmpegProc.on('error', (err) => {
                statMonitor.updateFileTypeStatus(this.converter.getFormatName(), statusMonitor.STATUSES.ERROR);
                reject(err);
            });
            this.ffmpegProc.run();
        });
    }
}
module.exports = converterHOC; 