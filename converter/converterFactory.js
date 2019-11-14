const DashConverter = require('./dashConverter');
const HLSConverter = require('./hlsConverter');
const MP4Converter = require('./hlsConverter')
class converterFactory{
    static supportedTypes(){
        return {
        DASH: 'dash',
        HLS: 'hls',
        MP4: 'mp4'
    };}

    static getCoverter(type){
        switch(type){
            case converterFactory.supportedTypes.DASH:
               return new DashConverter();
            case converterFactory.supportedTypes.HLS:
                return new HLSConverter();
            case converterFactory.supportedTypes.MP4:
                return new MP4Converter();
        }
    }
}

module.exports = converterFactory;