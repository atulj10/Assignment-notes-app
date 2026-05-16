import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];
