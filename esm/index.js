/*! (c) Andrea Giammarchi - ISC */

const LIST = '[]';
const EMPTY = '';
const OPTIONAL = '?';

const {iterator} = Symbol;

/**
 * @typedef {Object} PathInfo the `info` object passed to the callback
 * @property {number} id the current unique id/index of the path
 * @property {string} field the object field (last field of the path)
 * @property {string} hint the path hint for the field: `""`, `"[]""`, or `"?""`
 * @property {boolean} optional `true` if the current field was optional
 */

/**
 * @callback PathCallback
 * @param {PathInfo} info details related to the last field of the path
 * @param {any} value the target path field value, if any
 * @returns {any} if a value is returned, it overrides the original field
 */

/**
 * Recursively crawls paths, branching when arrays are in the middle.
 * Invoke the callback at the end various info plus the field value.
 * If the callback returns a non undefined value, it overrides the original field with it.
 * @param {string[]} paths paths to crawl through the object.
 * @param {PathCallback} callback a `callback(info, value)` function, invoked per each target.
 * @param {Object} object a generic object literal to crawl via all paths.
 */
export const crawl = (paths, callback, object) => {
  let i = 0;
  const re = /(\?|\[\])?\./g;
  for (const target of paths) {
    const path = [];
    let j = 0;
    let match = null;
    let optional = EMPTY;
    while (match = re.exec(target + '.')) {
      const {0: {length}, 1: hint, index} = match;
      if (index - j)
        path.push([target.slice(j, index), hint || EMPTY]);
      else
        optional = hint;
      j = index + length;
    }
    crawlPath(callback, i++, optional, object, path);
  }
};

const crawlPath = (callback, id, optional, object, path) => {
  for (let {length} = path, i = 0; i < length;) {
    const [field, hint] = path[i++];
    if (object[field] == null) {
      if (optional === OPTIONAL)
        break;
      throw new Error('invalid field ' + field);
    }
    if (i === length) {
      const override = callback(
        {id, field, hint, optional: optional === OPTIONAL},
        object[field]
      );
      if (typeof override !== 'undefined')
        object[field] = override;
      break;
    }
    optional = hint;
    object = object[field];
    if (hint === LIST || iterator in object) {
      const sub = path.slice(i);
      for (const value of object)
        crawlPath(callback, id, optional, value, sub);
      break;
    }
  }
};
