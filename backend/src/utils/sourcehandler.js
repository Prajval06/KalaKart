// Wraps async route handlers so you never need try/catch in controllers
// Without this: every controller needs try { } catch(e) { next(e) }
// With this: errors automatically go to the global error middleware

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;