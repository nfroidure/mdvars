var assert = require('assert')
  , MDVars = require(__dirname + '/../src/index.js')
  , Fs = require('fs')
  , StringDecoder = require('string_decoder').StringDecoder
  , VarStream = require('varstream');

// Helpers
function readMetadatas(file, done, noNew, novarsend) {
  var decoder = new StringDecoder('utf8')
    , resObject =  {}
    , resOutput = ''
    , stream = Fs.createReadStream(__dirname+'/fixtures/'+file+'.meta.md')
      .pipe(noNew ? MDVars(resObject, 'prop') : new MDVars(resObject, 'prop'))
    , expOutput = Fs.readFileSync(__dirname+'/fixtures/'+file+'.md', 'utf8')
    , expObject = {}
    , varsstart = false
    , varsend = false
  ;

  stream.on('varsstart', function() {
    if(varsend) {
      throw 'varsend emitted befor varsstart';
    }
    varsstart = true;
  });

  stream.on('varsend', function(chunk) {
    if(!varsstart) {
      throw 'varsend emitted when varsstart hasn\'t been emitted yet';
    }
    varsend = true;
  });

  stream.on('readable', function() {
    var chunk;
    while(chunk = stream.read()) {
      resOutput += decoder.write(chunk);
    }
  });

  stream.on('finish', function() {
    assert.equal(resOutput, expOutput);
    Fs.createReadStream(__dirname+'/fixtures/'+file+'.dat')
      .pipe(new VarStream(expObject, 'prop'))
      .on('finish', function() {
        assert.deepEqual(resObject, expObject);
        assert(varsstart);
        assert(novarsend ? !varsend : varsend);
        done();
      });
  });

  return stream;
}

describe('Reading metadata', function() {

  it("should work for a simple markdown file", function(done) {
    readMetadatas('simple', done);
  });

  it("should work for markdown file with unterminated flags", function(done) {
    readMetadatas('unflag', done);
  });

  it("should work when new is not used", function(done) {
    readMetadatas('simple', done, true);
  });

  it("should fail when unclosed variable chunk", function(done) {
    readMetadatas('unclosed', function() {}, true, true).on('error', function() {
      done();
    });
  });

});
