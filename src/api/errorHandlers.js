import R from 'ramda';
import express from 'express';

const notFound = (req, res, next) => {
  next([404, 'Resource not found']);
};

const errorHandler = (err, req, res, next) => {
  if (!R.isArrayLike(err) || err.length !== 2 || typeof err[0] !== 'number' || typeof err[1] !== 'string') {
    res.status(500);
    console.error(err.stack);
    return res.json({
      status,
      message: 'Internal server error'
    });
  }

  const [status, message] = err;
  res.status(status);
  res.json({
    status,
    message
  });
};

export default [notFound, errorHandler];