const sanitizeHtml = require("sanitize-html");

const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return sanitizeHtml(input, {
      allowedTags: ["b", "i", "em", "strong", "a"],
      allowedAttributes: { a: ["href"] },
      allowedIframeHostnames: ["www. youtube. com"],
    });
  }
  if (typeof input === "object" && input !== null) {
    Object.keys(input).forEach((key) => {
      input[key] = sanitizeInput(input[key]);
    });
  }
  return input;
};
const sanitizeMiddleware = (req, res, next) => {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);
  next();
};
module.exports = sanitizeMiddleware;
