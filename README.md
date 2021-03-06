# MDVars
> MDVars extracts metadata in Markdown files.

[![NPM version](https://badge.fury.io/js/mdvars.svg)](https://npmjs.org/package/mdvars) [![Build status](https://secure.travis-ci.org/nfroidure/mdvars.svg)](https://travis-ci.org/nfroidure/mdvars) [![Dependency Status](https://david-dm.org/nfroidure/mdvars.svg)](https://david-dm.org/nfroidure/mdvars) [![devDependency Status](https://david-dm.org/nfroidure/mdvars/dev-status.svg)](https://david-dm.org/nfroidure/mdvars#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/nfroidure/mdvars/badge.svg?branch=master)](https://coveralls.io/r/nfroidure/mdvars?branch=master)

## Usage
NodeJS module:
```js
var meta = {};
var Fs.createReadStream('markdown+metadatas.md')
  .pipe(new MDVars(meta, 'data'))
  .pipe(Fs.createWriteStream('markdownonly.md'));

console.log(meta.data);
// {title: 'A title', description: 'A description'}
```

## Format
```md
# A file
<!--VarStream
title=A title
description=A description
-->
Blahblahblah !
```

## Contributing
Feel free to pull your code if you agree with publishing it under the MIT license.
