# MDVars [![Build Status](https://travis-ci.org/nfroidure/mdvars.png?branch=master)](https://travis-ci.org/nfroidure/mdvars)

MDVars extracts meta datas in Markdown files.

## Usage
NodeJS module:
```js
var meta = {};
var Fs.createReadStream('markdown+metadatas.md')
  .pipe(new MDVars(meta,'data'))
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

