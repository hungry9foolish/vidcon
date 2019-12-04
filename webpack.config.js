module.exports = {
    entry: './server.js',
    output: {
      path: __dirname + './lib',
      filename: 'server.js',
      library: 'vidcon',
      libraryTarget: 'umd',
    }
  };