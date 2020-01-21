/**
 * Usage from console
 * npm run-script run -- --fileName <FileName with extension> --targetExtension <Extension to convert to>
 */

const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const os = require('os');
var fs = require('fs');

const args = require('minimist')(process.argv.slice(2));

if (os.platform() == 'win32') {
    let binarypath = path.resolve('./ffmpeg/bin/');
    let FfmpegPath = path.join(binarypath, 'ffmpeg.exe');

    try {
        var FfmpegPathInfo = fs.statSync(FfmpegPath);
    } catch (err) {
        throw err;
    }

    ffmpeg.setFfmpegPath(FfmpegPath);
    ffmpeg.setFfprobePath(path.join(binarypath, 'ffprobe.exe'));

    console.log('binarypath', path.join(binarypath, 'ffmpeg.exe'));
}

function metaFileExtension(targetFormat) {
    switch (targetFormat) {
        case 'hls':
            return 'm3u';
        case 'dash':
            return 'mpd';
        default:
            throw Error(`${targetFormat} is not a supported target format`);


    }
}

function consoleEncode(fileName, targetFormat, fileLocation) {
    // height, bitrate
    const sizes = [
        [240, 350],
        [480, 700],
        [720, 2500],
        [1080, 4000],
    ];
    const fallback = [720, 2500];
    const targetExtension = metaFileExtension(targetFormat);
    if (!fileLocation) {
        fileLocation = __dirname;
    }
    else if (!path.isAbsolute(fileLocation)) {
        fileLocation = path.join(__dirname, fileLocation);
    }
    let name = path.basename(fileName, path.extname(fileName));
    const targetdir = path.join(fileLocation, name, `${targetFormat}`);
    const sourcefn = path.resolve(path.join(fileLocation, fileName));
    const targetfn = path.join(targetdir, `${name}.${targetExtension}`);
    console.log('INFO', 'source', sourcefn);
    console.log('INFO', 'sizes', sizes);
    console.log('INFO', 'targetDirectory', targetdir);
    console.log('INFO', 'target filename', targetfn);

    try {
        var targetdirInfo = fs.statSync(targetdir);
    } catch (err) {
        if (err.code === 'ENOENT') {
            fs.mkdirSync(targetdir);
        } else {
            throw err;
        }
    }

    var proc = ffmpeg({
        source: sourcefn,
        cwd: targetdir
    });



    proc
        .output(targetfn)
        .format(targetFormat)
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


    for (var size of sizes) {
        let index = sizes.indexOf(size);

        proc
            .outputOptions([
                `-filter_complex [0]format=pix_fmts=yuv420p[temp${index}];[temp${index}]scale=-2:${size[0]}[A${index}]`,
                `-map [A${index}]:v`,
                `-b:v:${index} ${size[1]}k`,
            ]);
    }

    //Fallback version
    proc
        .output(path.join(targetdir, `${name}.mp4`))
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

    proc.on('start', function (commandLine) {
        console.log('progress', 'Spawned Ffmpeg with command: ' + commandLine);
    });

    proc.on('progress', function (info) {
        console.log('progress', info);
    })
        .on('end', function () {
            console.log('complete');
        })
        .on('error', function (err) {
            console.log('error', err);
        });
    return proc.run();
}

//console.log(args);
//consoleEncode(args['fileName'], args['targetExtension'], args['fileLocation']);

const s3FolderUploader = require('./s3Handler/s3FolderUploader');
const fileList = s3FolderUploader.fileWalker("videos/5762164d-9f87-4b16-8c68-a1a940c85f03");
console.log(fileList);