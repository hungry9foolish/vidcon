const Converter = require('./Converter');
const converterHOC= require('./ConverterHOC');
class MPEG4Converter extends Converter{
    constructor(){
        super();
    }
}

module.exports = converterHOC(MPEG4Converter);