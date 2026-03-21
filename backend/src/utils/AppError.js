class AppError extends Error {
  constructor(message, field = null, statusCode = 400) {
    super(message);
    this.name          = 'AppError';
    this.statusCode    = statusCode;
    this.field         = field;
    this.code          = null; // set by create()
    this.isOperational = true; // signals error.middleware to send structured response
  }

  static create(code, field = null) {
    const map = {
      // Auth
      EMAIL_ALREADY_EXISTS:     { msg: 'Email already exists',               status: 409 },
      INVALID_CREDENTIALS:      { msg: 'Invalid email or password',          status: 401 },
      ACCOUNT_DISABLED:         { msg: 'Account is disabled',                status: 403 },
      INVALID_REFRESH_TOKEN:    { msg: 'Invalid or expired refresh token',   status: 401 },
      // Access
      UNAUTHORIZED:             { msg: 'Authentication required',            status: 401 },
      FORBIDDEN:                { msg: 'Insufficient permissions',           status: 403 },
      // Products
      PRODUCT_NOT_FOUND:        { msg: 'Product not found',                  status: 404 },
      // Cart
      CART_EMPTY:               { msg: 'Cart is empty',                      status: 400 },
      CART_ITEM_NOT_FOUND:      { msg: 'Cart item not found',                status: 404 },
      INSUFFICIENT_INVENTORY:   { msg: 'Insufficient inventory',             status: 400 },
      INVALID_QUANTITY:         { msg: 'Quantity must be at least 1',        status: 400 },
      // Orders
      ORDER_NOT_FOUND:          { msg: 'Order not found',                    status: 404 },
      INVALID_ORDER_STATUS:     { msg: 'Invalid status transition',          status: 400 },
      // Payments
      PAYMENT_INTENT_FAILED:    { msg: 'Failed to create payment intent',    status: 502 },
      WEBHOOK_SIGNATURE_INVALID: { msg: 'Invalid webhook signature',         status: 400 },
    };

    const entry = map[code];
    if (!entry) {
      const err = new AppError('Something went wrong', field, 500);
      err.code = code;
      return err;
    }
    const err = new AppError(entry.msg, field, entry.status);
    err.code = code;
    return err;
  }
}

module.exports = AppError;