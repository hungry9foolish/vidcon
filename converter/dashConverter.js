const Converter = require('./Converter');
const converterHOC= require('./ConverterHOC');
class DashConverter extends Converter{
    constructor(){
        super();
    }
}

module.exports = converterHOC(DashConverter);