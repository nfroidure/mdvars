var assert = require('assert')
  , MDVars = require(__dirname + '/../src/index.js')
  , Fs = require('fs')
  , StringDecoder = require('string_decoder').StringDecoder
  , VarStream = require('varstream');

// Helpers
function readMetadatas(file, done) {
  var decoder = new StringDecoder('utf8')
    , resObject =  {}
    , resOutput = ''
    , stream = Fs.createReadStream(__dirname+'/fixtures/'+file+'.meta.md')
      .pipe(new MDVars(resObject, 'prop'))
    , expOutput = Fs.readFileSync(__dirname+'/fixtures/'+file+'.md', 'utf8')
    , expObject = {}
  ;

  stream.on('data', function(chunk) {
    resOutput += decoder.write(chunk);
  });

  stream.on('finish', function() {
    assert.equal(resOutput, expOutput);
    Fs.createReadStream(__dirname+'/fixtures/'+file+'.dat')
      .pipe(new VarStream(expObject, 'prop'))
      .on('finish', function() {
        assert.deepEqual(resObject, expObject);
        done();
      });
  });
}

describe('Reading metadata', function() {

  it("should work for a simple markdown file", function(done) {
    readMetadatas('simple', done);
  });

  it("should work for markdown file with unterminated flags", function(done) {
    readMetadatas('unflag', done);
  });

});
