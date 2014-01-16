/*
 * mdvars
 * https://github.com/nfroidure/mdvars
 *
 * Copyright (c) 2014 Nicolas Froidure
 * Licensed under the MIT license.
 */
"use strict";

// Required modules
var PassThrough = require('stream').PassThrough
  , util = require('util')
  , VarStream = require('varstream')
;

// Consts
var VAR_START_FLAG = '<!--VarStream'
  , VAR_END_FLAG = '-->'
;

// Inherit of PassThrough stream
util.inherits(MDVars, PassThrough);

// Constructor
function MDVars(root, prop) {

  // Ensure new were used
  if (!(this instanceof MDVars)) {
    throw Error('Please use the "new" operator to instanciate a MDVars object.');
  }

  // Parent constructor
  PassThrough.call(this);

  // Instantiate an internal VarStream
  this._varstream = new VarStream(root, prop);

  // Parsing states
  this._parsingVars = false;
  this._parsingRank = 0;
}

MDVars.prototype._transform = function(chunk, encoding, done) {
  var string = chunk.toString('utf-8');

  for(var i = 0, ii = string.length; i < ii; i++) {
    if(this._parsingVars) {
      // Looking for the end flag
      if(string[i] === VAR_END_FLAG[this._parsingRank]) {
        this._parsingRank++;
        // Got complete end flag
        if(this._parsingRank === VAR_END_FLAG.length) {
          this._parsingVars = false;
          this._parsingRank = 0;
          this.emit('varsend');
        }
        continue;
      // Write partial end flag to the varstream
      } else if(this._parsingRank) {
        this._unFlag();
      }
      // Write char to the varstream
      this._varstream.write(string[i]);
    } else {
      // Looking for the start flag
      if(string[i] === VAR_START_FLAG[this._parsingRank]) {
        this._parsingRank++;
        // Got complete start flag
        if(this._parsingRank === VAR_START_FLAG.length) {
          this._parsingVars = true;
          this._parsingRank = 0;
          this.emit('varsstart');
        }
        continue;
      // Pass partial start flag through
      } else if(this._parsingRank) {
        this._unFlag();
      }
      // Let is pass through
      this.push(string[i]);
    }
  }

  done();
};

MDVars.prototype._flush = function(done) {
  // Reemit unterminated flags
  this._unFlag();

  // Emit an error if metadatas are not closed
  if(this._parsingVars) {
    this.emit('error', new Error('Unclosed meta data section.'));
  }

  done();
};

MDVars.prototype._unFlag = function() {
  var string = '';
  for(var i = 0, ii = this._parsingRank; i < ii; i++) {
    string += this._parsingVars ? VAR_END_FLAG[i] : VAR_START_FLAG[i];
  }
  if(this._parsingVars) {
    this._varstream.write(string);
  } else {
    this.push(string);
  }
  this._parsingRank = 0;
};


module.exports = MDVars;

