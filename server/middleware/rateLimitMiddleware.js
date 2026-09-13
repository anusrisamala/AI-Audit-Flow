const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication requests. Please try again later.",
  },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many AI requests. Please try again later.",
  },
});

module.exports = {
  authLimiter,
  aiLimiter,
};
