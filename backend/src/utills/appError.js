class AppError extends Error {
  constructor(message, field = null, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
  }

  static create(code, field = null) {
    const errors = {
      EMAIL_ALREADY_EXISTS: new AppError('Email already exists', field, 400),
      INVALID_CREDENTIALS: new AppError('Invalid email or password', field, 401),
      ACCOUNT_DISABLED: new AppError('Account is disabled', field, 403),
      INVALID_REFRESH_TOKEN: new AppError('Invalid or expired refresh token', field, 401),
    };
    return errors[code] || new AppError('Something went wrong', field, 500);
  }
}

module.exports = AppError;