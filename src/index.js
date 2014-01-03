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

// Inherit of PassThrough stream
util.inherits(MDVars, PassThrough);

// Consts
var VAR_START_FLAG = '<!--VarStream'
  , VAR_END_FLAG = '-->'

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
        }
        continue;
      // Write partial end flag to the var stream
      } else if(this._parsingRank) {
        for(var j = 0, jj = this._parsingRank; j < jj; j++) {
          this._varstream.write(VAR_END_FLAG[j]);
        }
      }
      // Write char to the varstream
      this._varstream.write(string[i]);
    } else {
      // Looking for the start flag
      if(string[i] === VAR_START_FLAG[this._parsingRank]) {
        this._parsingRank++;
        // Got complete end flag
        if(this._parsingRank === VAR_START_FLAG.length) {
          this._parsingVars = true;
          this._parsingRank = 0;
        }
        continue;
      // Pass partial end flag through
      } else if(this._parsingRank) {
        for(var j = 0, jj = this._parsingRank; j < jj; j++) {
          this.push(VAR_START_FLAG[j]);
        }
      }
      // Let is pass through
      this.push(string[i]);
    }
  }

  done();
};

MDVars.prototype._flush = function(done) {
  

  done();
};


module.exports = MDVars;

