const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống. Vui lòng thử lại sau.';

  // Tránh lộ stack trace ra môi trường production
  const response = {
    error: true,
    message: message
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
