const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
