const Converter = require('./Converter');
const converterHOC= require('./ConverterHOC');
class DashConverter extends Converter{
    constructor(){
        super();
    }
    
    getExtension(){
        return 'mpd';
    }
    getFormatName(){
        return 'dash';
    }
}

module.exports = converterHOC(DashConverter);