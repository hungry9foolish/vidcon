const Converter = require('./Converter');
const converterHOC= require('./ConverterHOC');
class HlsConverter extends Converter{
    constructor(){
        super();
    }

    getExtension(){
        return 'm3u8';
    }
    getFormatName(){
        return 'hls';
    }
    getAdditionalOutputOptions(){
        return ['-hls_list_size 0'];
    }

}

module.exports = converterHOC(HlsConverter);