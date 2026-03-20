class AppError extends Error {
  constructor(statusCode, code, message, field = null) {
    super(message);
    this.statusCode  = statusCode;
    this.code        = code;         // machine-readable: "EMAIL_ALREADY_EXISTS"
    this.field       = field;        // optional: "email" (for validation errors)
    this.isOperational = true;       // our own errors vs unexpected crashes
  }
}

// Error code registry — all possible errors in one place
AppError.codes = {
  // Auth
  EMAIL_ALREADY_EXISTS:        { status: 409, message: 'Email is already registered' },
  INVALID_CREDENTIALS:         { status: 401, message: 'Invalid email or password' },
  ACCOUNT_DISABLED:            { status: 403, message: 'Account has been disabled' },
  TOKEN_EXPIRED:               { status: 401, message: 'Token has expired' },
  TOKEN_INVALID:               { status: 401, message: 'Token is invalid' },
  INVALID_REFRESH_TOKEN:       { status: 401, message: 'Refresh token is invalid or expired' },
  UNAUTHORIZED:                { status: 401, message: 'Authentication required' },
  FORBIDDEN:                   { status: 403, message: 'You do not have permission' },
  // Product
  PRODUCT_NOT_FOUND:           { status: 404, message: 'Product not found' },
  // Cart
  CART_EMPTY:                  { status: 400, message: 'Cart is empty' },
  CART_ITEM_NOT_FOUND:         { status: 404, message: 'Cart item not found' },
  INSUFFICIENT_INVENTORY:      { status: 400, message: 'Insufficient inventory for this product' },
  INVALID_QUANTITY:            { status: 400, message: 'Quantity must be at least 1' },
  // Order
  ORDER_NOT_FOUND:             { status: 404, message: 'Order not found' },
  INVALID_ORDER_STATUS:        { status: 400, message: 'Invalid order status transition' },
  ORDER_ALREADY_FULFILLED:     { status: 400, message: 'Order has already been fulfilled' },
  // Payment
  PAYMENT_INTENT_FAILED:       { status: 400, message: 'Failed to create payment intent' },
  WEBHOOK_SIGNATURE_INVALID:   { status: 400, message: 'Invalid webhook signature' },
  // General
  NOT_FOUND:                   { status: 404, message: 'Resource not found' },
  RATE_LIMIT_EXCEEDED:         { status: 429, message: 'Too many requests. Try again later' },
  INTERNAL_ERROR:              { status: 500, message: 'Something went wrong' },
};

// Factory: AppError.create('EMAIL_ALREADY_EXISTS')
AppError.create = (code, field = null) => {
  const def = AppError.codes[code];
  if (!def) throw new Error(`Unknown error code: ${code}`);
  return new AppError(def.status, code, def.message, field);
};

module.exports = AppError;