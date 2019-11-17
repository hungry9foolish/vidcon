const DashConverter = require('./dashConverter');
const HLSConverter = require('./hlsConverter');
const MP4Converter = require('./mpeg4Converter')
class converterFactory {
    static supportedTypes() {
        return {
            DASH: 'dash',
            HLS: 'hls',
            MP4: 'mp4'
        };
    }

    static getConverter(type, fileName, fileLocation) {
        switch (type) {
            case converterFactory.supportedTypes().DASH:
                return new DashConverter(fileName, fileLocation);
            case converterFactory.supportedTypes().HLS:
                return new HLSConverter(fileName, fileLocation);
            case converterFactory.supportedTypes().MP4:
                return new MP4Converter(fileName, fileLocation);
        }
    }
}

module.exports = converterFactory;