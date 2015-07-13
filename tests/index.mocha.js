var assert = require('assert');
var MDVars = require(__dirname + '/../src/index.js');
var fs = require('fs');
var VarStream = require('varstream');
var streamtest = require('streamtest');

describe('Reading metadata', function() {

  // Iterating through versions
  streamtest.versions.forEach(function(version) {

    describe('for ' + version + ' streams', function() {

      it("should work for a simple markdown file", function(done) {
        var destObject =  {};
        decorate(fs.createReadStream(__dirname + '/fixtures/simple.meta.md'))
          .pipe(new MDVars(destObject, 'metadata'))
          .pipe(streamtest[version].toText(function(err, text) {
            var expObject = {};
            if(err) {
              return done(err);
            }
            assert.equal(
              text,
              fs.readFileSync(__dirname + '/fixtures/simple.md', 'utf8')
            );
            fs.createReadStream(__dirname + '/fixtures/simple.dat')
              .pipe(new VarStream(expObject, 'metadata'))
              .on('finish', function() {
                assert.deepEqual(destObject, expObject);
                done();
              });
          }));
      });

      it("should work for markdown file with unterminated flags", function(done) {
        var destObject =  {};
        decorate(fs.createReadStream(__dirname + '/fixtures/unflag.meta.md'))
          .pipe(new MDVars(destObject, 'metadata'))
          .pipe(streamtest[version].toText(function(err, text) {
            var expObject = {};
            if(err) {
              return done(err);
            }
            assert.equal(
              text,
              fs.readFileSync(__dirname + '/fixtures/unflag.md', 'utf8')
            );
            fs.createReadStream(__dirname + '/fixtures/unflag.dat')
              .pipe(new VarStream(expObject, 'metadata'))
              .on('finish', function() {
                assert.deepEqual(destObject, expObject);
                done();
              });
          }));
      });

      it("should work when new is not used", function(done) {
        var destObject =  {};
        decorate(fs.createReadStream(__dirname + '/fixtures/simple.meta.md'))
          .pipe(MDVars(destObject, 'metadata'))
          .pipe(streamtest[version].toText(function(err, text) {
            var expObject = {};
            if(err) {
              return done(err);
            }
            assert.equal(
              text,
              fs.readFileSync(__dirname + '/fixtures/simple.md', 'utf8')
            );
            fs.createReadStream(__dirname + '/fixtures/simple.dat')
              .pipe(new VarStream(expObject, 'metadata'))
              .on('finish', function() {
                assert.deepEqual(destObject, expObject);
                done();
              });
          }));
      });

      it("should fail when unclosed variable chunk", function(done) {
        var destObject =  {};
        decorate(fs.createReadStream(__dirname + '/fixtures/unclosed.meta.md'))
          .pipe(new MDVars(destObject, 'metadata'))
          .on('error', function(err) {
            assert.equal(err.message, 'Unclosed meta data section.');
            done();
          })
          .pipe(streamtest[version].toText(function(err, text) {
            assert(text, fs.readFileSync(__dirname + '/fixtures/unclosed.md', 'utf8') )
          }));
      });

    });

  });

});

// Add some more checks for testing
function decorate(stream, done) {
  var varsstart = false;
  var varsend = false;

  stream.on('varsstart', function() {
    if(varsend) {
      done(new Error('varsend emitted before varsstart'));
    }
    varsstart = true;
  });

  stream.on('varsend', function(chunk) {
    if(!varsstart) {
      done(new Error('varsend emitted when varsstart hasn\'t been emitted yet'));
    }
    varsend = true;
  });

  return stream;
}
