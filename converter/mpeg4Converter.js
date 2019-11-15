const Converter = require('./Converter');
const converterHOC= require('./ConverterHOC');
class MPEG4Converter extends Converter{
    constructor(){
        super();
    }

    getExtension(){
        return 'mp4';
    }
    getFormatName(){
        return 'mp4';
    }
}

module.exports = converterHOC(MPEG4Converter);