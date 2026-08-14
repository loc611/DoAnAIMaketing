const { ZodError } = require('zod');

/**
 * Middleware để validate request (body, query, params) sử dụng Zod schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      // Format lỗi Zod cho dễ đọc
      const errorMessages = err.issues.map((issue) => issue.message);
      return res.status(400).json({
        error: true,
        message: errorMessages.join(', '),
        details: errorMessages,
      });
    }
    next(err);
  }
};

module.exports = validate;
