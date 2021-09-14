const {crawl} = require('../cjs');

crawl(
  ['?.test.a.b'],
  (info, value) => {
    console.assert(value === 123, 'correct value');
    console.assert(JSON.stringify(info) === '{"id":0,"field":"b","hint":"","optional":false}', 'correct info');
  },
  {
    test: {
      a: {
        b: 123
      }
    }
  }
);

try {
  crawl(
    ['test.a.b'],
    (info, value) => {
      console.assert(false, 'non optional path was invoked');
    },
    {
      test: {
        a: {}
      }
    }
  );
}
catch (ok) {}

crawl(
  ['test?.a[].b'],
  (info, value) => {
    console.assert(false, 'optional should not be invoked');
  },
  {
    test: {}
  }
);

crawl(
  ['test.a?.b'],
  (info, value) => {
    console.assert(value === 123, 'correct value');
    console.assert(JSON.stringify(info) === '{"id":0,"field":"b","hint":"","optional":true}', 'correct info');
  },
  {
    test: {
      a: {
        b: 123
      }
    }
  }
);

const override = {
  test: {
    a: [
      {b: [1, 2]},
      {b: [1, 2]}
    ]
  }
};
crawl(
  ['test.a.b[]'],
  (info, value) => {
    console.assert(value.join(',') === '1,2', 'correct array value');
    console.assert(JSON.stringify(info), '{"id":0,"field":"b","hint":"[]","optional":false} {"id":0,"field":"b","hint":"","optional":false}', 'correct info');
    return [3, 4];
  },
  override
);

console.assert(override.test.a[0].b.join(',') === '3,4', 'value overridden');
console.assert(override.test.a[1].b.join(',') === '3,4', 'value overridden');


const demo = {
  test: {
    some: [
      // will become [1, 4, 9]
      {number: [1, 2, 3]},
      // will become [16, 25]
      {number: [4, 5]}
    ]
  }
};

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
  demo
);

console.assert(JSON.stringify(demo) === '{"test":{"some":[{"number":[1,4,9]},{"number":[16,25]}]}}');
