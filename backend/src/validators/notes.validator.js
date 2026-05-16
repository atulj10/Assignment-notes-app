const { body, query, param } = require('express-validator');

const createNoteValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),
];

const updateNoteValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),
];

const shareNoteValidator = [
  body('share_with_email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email'),
];

const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

const searchValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required'),
];

module.exports = { createNoteValidator, updateNoteValidator, shareNoteValidator, paginationValidator, searchValidator };
