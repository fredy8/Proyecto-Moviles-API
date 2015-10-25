import { allPass, compose, not, is, map, apply, toPairs, propSatisfies, reverse, both, gte, lte, length, all, curryN, __ } from 'ramda';

const isNumber = allPass([compose(not, isNaN), is(Number), (x) => Number.isInteger(x)]);
const makeValidator = compose(allPass,
  map(compose(apply(propSatisfies), reverse)),
  toPairs);
const validateObject = (validations, obj) => allPass([is(Object), makeValidator(validations)], obj);
const isStringWithLength = (min, max) => allPass([is(String), compose(both(gte(__, min), lte(__, max)), length)]);
const inRange = (min, max) => both(gte(__, min), lte(__, max));

export default {
  isNumber,
  isNumberInRange: curryN(3, (min, max, num) => allPass([isNumber, inRange(min, max)], num)),
  validateObject: curryN(2, validateObject),
  isStringWithLength: curryN(2, isStringWithLength),
  username: isStringWithLength(4, 24),
  password: isStringWithLength(6, 30)
};
