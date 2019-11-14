const Converter = require('./Converter');
const converterHOC= require('./ConverterHOC');
class HlsConverter extends Converter{
    constructor(){
        super();
    }
}

module.exports = converterHOC(HlsConverter);