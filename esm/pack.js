/*! (c) Andrea Giammarchi - ISC */

import {crawl} from './index.js';

const LIST = '[]';

const {iterator} = Symbol;

// copy objects/arrays and transform iterables in arrays
const copy = input => {
  if (typeof input === 'object' && input) {
    if (iterator in input) {
      const values = [];
      for (const value of input)
        values.push(copy(value));
      input = values;
    }
    else {
      const output = {};
      for (const key in input)
        output[key] = copy(input[key]);
      input = output;
    }
  }
  return input;
};

/**
 * @typedef {[array[], object]} PackedResult an array with values as first entry,
 * and the optimized object as second one.
 */

/**
 * Given one or more target paths, returns a specialized object that can be
 * unpacked later on, through the indexed values grouped as unique IDs.
 * Please note: this method **mutates** the entry `object`.
 * @param {string[]} targets paths to transform as indexed values.
 * @param {Array|Object} object a JSON serializable object.
 * @returns {PackedResult}
 */
export const packDirect = (targets, object) => {
  const _ = new Map;
  const callback = ({id, hint}, target) => {
    if (!_.has(id))
      _.set(id, new Map);
    const map = _.get(id);
    const result = [];
    const all = hint === LIST;
    for (const values of all ? target : [target]) {
      const indexes = [];
      for (const value of values) {
        if (!map.has(value))
          map.set(value, map.size);
        indexes.push(map.get(value));
      }
      result.push([indexes, id]);
    }
    return all ? result : result.shift();
  };
  crawl(targets, callback, object);
  return [[..._.values()].map(_ => [..._.keys()]), object];
};

/**
 * Given one or more target paths, returns a specialized object that can be
 * unpacked later on, through the indexed values grouped as unique IDs.
 * @param {string[]} targets paths to transform as indexed values.
 * @param {Array|Object} object a JSON serializable object.
 * @returns {PackedResult}
 */
export const packCopy = (targets, object) => packDirect(targets, copy(object));

/**
 * Given the same `targets` used to pack an object, returns the original object with
 * indexed values revived as original values.
 * Please note: this method **mutates** the passed `object` within the `$` field.
 * @param {string[]} targets paths to reach and revive indexes as values.
 * @param {PackedResult} array
 * @returns {Array|Object}
 */
export const unpackDirect = (targets, [_, $]) => {
  const callback = ({hint}, target) => {
    const result = [];
    const all = hint === LIST;
    for (const [indexes, index] of all ? target : [target])
      result.push(indexes.map(_[index].get, _[index]));
    return all ? result : result.shift();
  };
  _ = _.map(indexes => indexes.reduce((map, v, i) => map.set(i, v), new Map));
  crawl(targets, callback, $);
  return $;
};

/**
 * Given the same `targets` used to pack an object, returns a copy of the original object
 * with indexed values revived as original values.
 * @param {string[]} targets paths to reach and revive indexes as values.
 * @param {PackedResult} array
 * @returns {Array|Object}
 */
export const unpackCopy = (targets, [_, $]) => unpackDirect(targets, [_, copy($)]);
