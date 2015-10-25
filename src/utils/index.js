import R from 'ramda';

const stringWithLength = 
  (minLen, maxLen, obj) =>
    R.allPass([R.is(String), () => obj.length >= minLen, () => obj.length <= maxLen], obj);

export default{
  stringWithLength
};