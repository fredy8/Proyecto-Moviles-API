export default {
  requireAuth: (req, res, next) => {
    if (!req.username) {
      return next([401, 'Unauthorized.']);
    }

    next();
  }
};