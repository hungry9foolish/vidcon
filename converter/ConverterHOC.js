const converterHOC = (Converter) => class {
    constructor(){
        this.converter = new Converter();
    }

    convert(params) {
        this.converter.convert();
    }
}
module.exports = converterHOC; 