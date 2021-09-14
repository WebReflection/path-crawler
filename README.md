# path-crawler

![build status](https://github.com/WebReflection/path-crawler/actions/workflows/node.js.yml/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/path-crawler/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/path-crawler?branch=main)

An utility to crawl generic objects paths.

```js
import {crawl} from 'path-crawler';
// const {crawl} = require('path-crawler');

crawl(
  ['test?.some.number[]'],
  ({id, field, hint, optional}, value) => {
    // id is the unique path index, 0 in this case
    // field is the last field of the path: "number"
    // hint can be empty string, ?, or []
    // optional is true if the field was optional
    // if non undefined value is returned,
    // the original field is overwritten with the new value.
    return value.map(x => x * x);
  },
  {
    test: {
      some: [
        // will become [1, 4, 9]
        {number: [1, 2, 3]},
        // will become [16, 25]
        {number: [4, 5]}
      ]
    }
  }
);
```
